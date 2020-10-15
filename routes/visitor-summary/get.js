import knex from '@api/database'
import { format, addDays, getWeek, addWeeks, getMonth, addMonths } from 'date-fns'
import { BadRequestError } from '@helpers/errors'

const months = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
}

export default async (req, res) => {
    validateParams(req.query)
    const [visitorSummary] = await getVisitorSummary(req.query)
    const formatSummary = formatVisitorSummary(visitorSummary, req.query)

    return res.success(formatSummary)
}

function validateParams({ deviceIds, dataPointType, endDate, dataPointNumber, traffic }) {
    if (!dataPointType) throw new BadRequestError("dataPointType should be a string 'daily', 'monthy' or 'weekly' ")
    if (!dataPointNumber) throw new BadRequestError("dataPointNumber should be a number")
    if (!endDate) throw new BadRequestError("endDate missing")
    if (traffic && !['exit', 'entry', 'both'].includes(traffic)) throw new BadRequestError("traffic must be exit, entry or both")
}

function getVisitorSummary({ deviceIds, dataPointType, endDate, dataPointNumber, traffic }) {
    let labelColumn = ""
    let interval = ""
    let groupBy = ""
    if (dataPointType === 'daily') {
        labelColumn = "DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(dl.detectionTime)), '%Y-%m-%d') as label";
        interval = 'DAY'
        groupBy = "DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(dl.detectionTime)), '%Y-%m-%d')"
    }
    if (dataPointType === 'weekly') {
        labelColumn = "WEEK(dl.detectionTime) as label";
        interval = 'WEEK'
        groupBy = "WEEK(dl.detectionTime)"
    }
    if (dataPointType === 'monthly') {
        labelColumn = "MONTHNAME(dl.detectionTime) as label, MONTH(dl.detectionTime) as monthKey";
        interval = 'MONTH'
        groupBy = "MONTHNAME(dl.detectionTime)"
    }

    let condition = "true"
    if (deviceIds && deviceIds.length) condition = condition + ` AND dl.fromDevice IN (${deviceIds.split(',').map(id => "'" + id + "'").join(",")})`
    if (endDate) condition = condition + ` AND dl.detectionTime >= "${endDate} 00:00:00"`
    if (endDate && dataPointNumber) condition = condition + ` AND dl.detectionTime <= DATE_ADD('${endDate}', INTERVAL ${dataPointNumber} ${interval})`
    if (traffic && traffic!=='both') {
      if (traffic === 'exit') {
        condition = condition + `AND dv.type='OUT'`
      } else {
        condition = condition + `AND dv.type='IN'`
      }
    }

    return knex.raw(`
        SELECT ${labelColumn}, 
            COUNT(*) as total, 
            sum(case when dl.type = 'STRANGER' then 1 else 0 end) as no_stranger,
            sum(case when dl.type = 'REGISTERED_USER' then 1 else 0 end) as no_user
        FROM detection_logs as dl
        LEFT JOIN devices as dv ON dl.fromDevice = dv.name
        WHERE ${condition}
        GROUP BY ${groupBy}
        ORDER BY dl.detectionTime ASC;
    `)
}

function formatVisitorSummary(summary, { dataPointType, endDate, dataPointNumber }) {
    if (dataPointType === "daily") {
        for (let i = 0; i < dataPointNumber; i++) {
            const present = new Date(endDate)
            const dateKey = format(addDays(present, i), "yyyy-MM-dd")
            const isDateRecordExist = summary.find(record => record.label === dateKey)
            if (isDateRecordExist) continue

            summary = [
                ...summary,
                {
                    label: dateKey,
                    no_stranger: 0,
                    no_user: 0,
                    total: 0
                }
            ]
        }

        return summary.sort(function (a, b) {
            return new Date(a.label) - new Date(b.label);
        });
    }
    if (dataPointType === "weekly") {
        let resultByWeek = [];
        for (let i = 0; i < dataPointNumber; i++) {
            const currentDate = new Date(endDate)
            const weekKey = getWeek(addWeeks(currentDate, i))
            const existWeekRecord = summary.find(record => record.label === weekKey)
            if (existWeekRecord) {
                const { label, no_stranger, no_user, total } = existWeekRecord
                resultByWeek = [...resultByWeek, {
                    label,
                    total,
                    no_stranger,
                    no_user
                }]
            } else {
                resultByWeek = [...resultByWeek,
                {
                    label: weekKey,
                    no_stranger: 0,
                    no_user: 0,
                    total: 0
                }]
            }

        }
        return resultByWeek
    }
    if (dataPointType === "monthly") {
        let resultByMonth = [];
        for (let i = 0; i < dataPointNumber; i++) {
            const currentDate = new Date(endDate)
            const monthKey = getMonth(addMonths(currentDate, i)) + 1
            const existMonthRecord = summary.find(record => record.monthKey === monthKey)
            if (existMonthRecord) {
                const { label, no_stranger, no_user, total } = existMonthRecord
                resultByMonth = [...resultByMonth, {
                    label,
                    total,
                    no_stranger,
                    no_user
                }]
            } else {
                resultByMonth = [...resultByMonth,
                {
                    label: months[monthKey],
                    no_stranger: 0,
                    no_user: 0,
                    total: 0
                }]
            }
        }
        return resultByMonth.map(({ label, no_stranger, no_user, total }) => {
            return {
                label: label.substring(0, 3),
                no_stranger,
                no_user,
                total,
            }
        });
    }
}