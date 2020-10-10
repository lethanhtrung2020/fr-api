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
        labelColumn = "WEEK(detectionTime, 1) as label";
        interval = 'WEEK'
        groupBy = "WEEK(detectionTime, 1)"
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
            sum(case when type = 'STRANGER' AND bodyTemperature>=35.5 AND bodyTemperature <=37.5 then 1 else 0 end) as no_stranger_pass,
            sum(case when type = 'STRANGER' AND (bodyTemperature<35.5 OR bodyTemperature >37.5) then 1 else 0 end) as no_stranger_fail,
            sum(case when type = 'STRANGER' then 1 else 0 end) as total_stranger,
            sum(case when type = 'REGISTERED_USER' AND bodyTemperature>=35.5 AND bodyTemperature <=37.5 then 1 else 0 end) as no_user_pass,
            sum(case when type = 'REGISTERED_USER' AND (bodyTemperature<35.5 OR bodyTemperature >37.5) then 1 else 0 end) as no_user_fail,
            sum(case when type = 'REGISTERED_USER' then 1 else 0 end) as total_user
        FROM detection_logs
        WHERE ${condition}
        GROUP BY ${groupBy}
        ORDER BY detectionTime ASC;
    `)
}

function formatVisitorSummary(summary, { dataPointType, endDate, dataPointNumber }) {
    let resultSummary = {
        registered: [],
        guest: []
    }
    console.log(summary)
    if (dataPointType === "daily") {
        for (let i = 0; i < dataPointNumber; i++) {
            const present = new Date(endDate)
            const dateKey = format(subDays(present, i), "yyyy-MM-dd")
            const dateRecord = summary.find(record => record.label === dateKey)
            if (dateRecord) {
                resultSummary.registered = [
                    ...resultSummary.registered,
                    {
                        label: dateKey,
                        passed: dateRecord.no_user_pass,
                        failed: dateRecord.no_user_fail,
                        total: dateRecord.total_user
                    }
                ]
                resultSummary.guest = [
                    ...resultSummary.guest,
                    {
                        label: dateKey,
                        passed: dateRecord.no_stranger_pass,
                        failed: dateRecord.no_stranger_fail,
                        total: dateRecord.total_stranger
                    }
                ]
            } else {
                resultSummary.registered = [
                    ...resultSummary.registered,
                    {
                        label: dateKey,
                        passed: 0,
                        failed: 0,
                        total: 0
                    }
                ]
                resultSummary.guest = [
                    ...resultSummary.guest,
                    {
                        label: dateKey,
                        passed: 0,
                        failed: 0,
                        total: 0
                    }
                ]
            }
        }

        resultSummary.registered.sort(function (a, b) {
            return new Date(a.label) - new Date(b.label);
        });
        resultSummary.guest.sort(function (a, b) {
            return new Date(a.label) - new Date(b.label);
        });

        return resultSummary
    }

    if (dataPointType === "weekly") {
        for (let i = 0; i < dataPointNumber; i++) {
            const currentDate = new Date(endDate)
            const weekKey = getWeek(subWeeks(currentDate, i))
            console.log(139, weekKey);
            const weeklyRecord = summary.find(record => record.label === weekKey)

            if (weeklyRecord) {
                resultSummary.registered = [
                    ...resultSummary.registered,
                    {
                        label: weekKey,
                        passed: weeklyRecord.no_user_pass,
                        failed: weeklyRecord.no_user_fail,
                        total: weeklyRecord.total_user
                    }
                ]
                resultSummary.guest = [
                    ...resultSummary.guest,
                    {
                        label: weekKey,
                        passed: weeklyRecord.no_stranger_pass,
                        failed: weeklyRecord.no_stranger_fail,
                        total: weeklyRecord.total_stranger
                    }
                ]
            } else {
                resultSummary.registered = [
                    ...resultSummary.registered,
                    {
                        label: weekKey,
                        passed: 0,
                        failed: 0,
                        total: 0
                    }
                ]
                resultSummary.guest = [
                    ...resultSummary.guest,
                    {
                        label: weekKey,
                        passed: 0,
                        failed: 0,
                        total: 0
                    }
                ]
            }
        }

        resultSummary.registered.sort(function (a, b) {
            return new Date(a.label) - new Date(b.label);
        });
        resultSummary.guest.sort(function (a, b) {
            return new Date(a.label) - new Date(b.label);
        });

        return resultSummary
    }
    if (dataPointType === "monthly") {
        for (let i = 0; i < dataPointNumber; i++) {
            const currentDate = new Date(endDate)
            const monthKey = getMonth(subMonths(currentDate, i)) + 1
            const index = summary.findIndex(record => record.label === months[monthKey])
            if (index > -1) {
                resultSummary.registered = [
                    ...resultSummary.registered,
                    {
                        label: summary[index].label,
                        monthKey,
                        passed: summary[index].no_user_pass,
                        failed: summary[index].no_user_fail,
                        total: summary[index].total_user
                    }
                ]
                resultSummary.guest = [
                    ...resultSummary.guest,
                    {
                        label: summary[index].label,
                        monthKey,
                        passed: summary[index].no_stranger_pass,
                        failed: summary[index].no_stranger_fail,
                        total: summary[index].total_stranger
                    }
                ]
                continue
            } else {
                resultSummary.registered = [
                    ...resultSummary.registered,
                    {
                        label: months[monthKey],
                        monthKey,
                        passed: 0,
                        failed: 0,
                        total: 0
                    }
                ]
                resultSummary.guest = [
                    ...resultSummary.guest,
                    {
                        label: months[monthKey],
                        monthKey,
                        passed: 0,
                        failed: 0,
                        total: 0
                    }
                ]
            }
        }

        resultSummary.registered = resultSummary.registered.sort(function (a, b) {
            return a.monthKey - b.monthKey;
        }).map(({ label, passed, failed, total }) => {
            return {
                label: label.substring(0, 3),
                passed,
                failed,
                total
            }
        });
        resultSummary.guest = resultSummary.guest.sort(function (a, b) {
            return a.monthKey - b.monthKey;
        }).map(({ label, passed, failed, total }) => {
            return {
                label: label.substring(0, 3),
                passed,
                failed,
                total
            }
        });

        return resultSummary
    }
}