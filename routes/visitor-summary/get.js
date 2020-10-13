import knex from '@api/database'
import { format, subDays, getWeek, subWeeks, getMonth, subMonths } from 'date-fns'
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
    console.log(23, visitorSummary);
    const formatSummary = formatVisitorSummary(visitorSummary, req.query)

    return res.success(formatSummary)
}

function validateParams({ deviceIds, dataPointType, endDate, dataPointNumber }) {
    if (!dataPointType) throw new BadRequestError("dataPointType should be a string 'daily', 'monthy' or 'weekly' ")
    if (!dataPointNumber) throw new BadRequestError("dataPointNumber should be a number")
    if (!endDate) throw new BadRequestError("endDate missing")
}

function getVisitorSummary({ deviceIds, dataPointType, endDate, dataPointNumber }) {
    let labelColumn = ""
    let interval = ""
    let groupBy = ""
    if (dataPointType === 'daily') {
        labelColumn = "DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(detectionTime)), '%Y-%m-%d') as label";
        interval = 'DAY'
        groupBy = "DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(detectionTime)), '%Y-%m-%d')"
    }
    if (dataPointType === 'weekly') {
        labelColumn = "WEEK(detectionTime) as label";
        interval = 'WEEK'
        groupBy = "WEEK(detectionTime)"
    }
    if (dataPointType === 'monthly') {
        labelColumn = "MONTHNAME(detectionTime) as label";
        interval = 'MONTH'
        groupBy = "MONTHNAME(detectionTime)"
    }

    let condition = "true"
    if (deviceIds && deviceIds.length) condition = condition + ` AND fromDevice IN (${deviceIds.split(',').map(id => "'" + id + "'").join(",")})`
    if (endDate) condition = condition + ` AND detectionTime <= "${endDate} 23:59:59"`
    if (endDate && dataPointNumber) condition = condition + ` AND detectionTime >= DATE_SUB('${endDate}', INTERVAL ${dataPointNumber} ${interval})`

    return knex.raw(`
        SELECT ${labelColumn}, 
            COUNT(*) as total, 
            sum(case when type = 'STRANGER' then 1 else 0 end) as no_stranger,
            sum(case when type = 'REGISTERED_USER' then 1 else 0 end) as no_user
        FROM detection_logs
        WHERE ${condition}
        GROUP BY ${groupBy}
        ORDER BY detectionTime ASC;
    `)
}

function formatVisitorSummary(summary, { dataPointType, endDate, dataPointNumber }) {
    if (dataPointType === "daily") {
        for (let i = 0; i < dataPointNumber; i++) {
            const present = new Date(endDate)
            const dateKey = format(subDays(present, i), "yyyy-MM-dd")
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
        for (let i = 0; i < dataPointNumber; i++) {
            const currentDate = new Date(endDate)
            const weekKey = getWeek(subWeeks(currentDate, i))
            const isWeekRecordExist = summary.find(record => record.label === weekKey)
            if (isWeekRecordExist) continue

            summary = [
                ...summary,
                {
                    label: weekKey,
                    no_stranger: 0,
                    no_user: 0,
                    total: 0
                }
            ]
        }
        return summary.sort(function (a, b) {
            return a.label - b.label;
        });
    }
    if (dataPointType === "monthly") {
        for (let i = 0; i < dataPointNumber; i++) {
            const currentDate = new Date(endDate)
            const monthKey = getMonth(subMonths(currentDate, i)) + 1
            const index = summary.findIndex(record => record.label === months[monthKey])
            if (index > -1) {
                summary[index].monthKey = monthKey
                continue
            }

            summary = [
                ...summary,
                {
                    label: months[monthKey],
                    monthKey,
                    no_stranger: 0,
                    no_user: 0,
                    total: 0
                }
            ]
        }
        return summary.sort(function (a, b) {
            return a.monthKey - b.monthKey;
        }).map(({ label, no_stranger, no_user, total }) => {
            return {
                label: label.substring(0, 3),
                no_stranger,
                no_user,
                total,
            }
        });
    }
}