import knex from '@api/database'
import {
  format,
  addDays,
  getWeek,
  addWeeks,
  getMonth,
  addMonths
} from 'date-fns'
import { BadRequestError } from '@helpers/errors'

const months = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
}

export default async (req, res) => {
  validateParams(req.query)
  const [visitorSummary] = await getVisitorSummary(req.query)
  const formatSummary = formatVisitorSummary(visitorSummary, req.query)

  return res.success(formatSummary)
}

function validateParams({
  deviceIds,
  dataPointType,
  endDate,
  dataPointNumber,
  traffic
}) {
  if (!dataPointType)
    throw new BadRequestError(
      "dataPointType should be a string 'daily', 'monthy' or 'weekly' "
    )
  if (!dataPointNumber)
    throw new BadRequestError('dataPointNumber should be a number')
  if (!endDate) throw new BadRequestError('endDate missing')
  if (traffic && !['exit', 'entry', 'both'].includes(traffic)) throw new BadRequestError("traffic must be exit, entry or both")
}

function getVisitorSummary({
  deviceIds,
  dataPointType,
  endDate,
  dataPointNumber,
  traffic
}) {
  let labelColumn = ''
  let interval = ''
  let groupBy = ''
  if (dataPointType === 'daily') {
    labelColumn =
      "DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(dl.detectionTime)), '%Y-%m-%d') as label"
    interval = 'DAY'
    groupBy =
      "DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(dl.detectionTime)), '%Y-%m-%d')"
  }
  if (dataPointType === 'weekly') {
    labelColumn = 'WEEK(dl.detectionTime, 1) as label'
    interval = 'WEEK'
    groupBy = 'WEEK(dl.detectionTime, 1)'
  }
  if (dataPointType === 'monthly') {
    labelColumn =
      'MONTHNAME(dl.detectionTime) as label, MONTH(dl.detectionTime) as monthKey'
    interval = 'MONTH'
    groupBy = 'MONTHNAME(dl.detectionTime)'
  }

  let condition = 'true'
  if (deviceIds && deviceIds.length)
    condition =
      condition +
      ` AND fromDevice IN (${deviceIds
        .split(',')
        .map(id => "'" + id + "'")
        .join(',')})`
  if (endDate)
    condition = condition + ` AND dl.detectionTime >= "${endDate} 00:00:00"`
  if (endDate && dataPointNumber)
    condition =
      condition +
      ` AND dl.detectionTime <= DATE_ADD('${endDate} 00:00:00', INTERVAL ${dataPointNumber} ${interval})`
  if (traffic && traffic!=='both') {
  if (traffic === 'exit') {
      condition = condition + `AND dv.type='OUT'`
  } else {
      condition = condition + `AND dv.type='IN'`
  }
  }

  return knex.raw(`
        SELECT ${labelColumn},
            sum(case when dl.type = 'STRANGER' AND dl.bodyTemperature>=35.5 AND dl.bodyTemperature <=37.5 then 1 else 0 end) as no_stranger_pass,
            sum(case when dl.type = 'STRANGER' AND (dl.bodyTemperature<35.5 OR dl.bodyTemperature >37.5) then 1 else 0 end) as no_stranger_fail,
            sum(case when dl.type = 'STRANGER' then 1 else 0 end) as total_stranger,
            sum(case when dl.type = 'REGISTERED_USER' AND dl.bodyTemperature>=35.5 AND dl.bodyTemperature <=37.5 then 1 else 0 end) as no_user_pass,
            sum(case when dl.type = 'REGISTERED_USER' AND (dl.bodyTemperature<35.5 OR dl.bodyTemperature >37.5) then 1 else 0 end) as no_user_fail,
            sum(case when dl.type = 'REGISTERED_USER' then 1 else 0 end) as total_user
        FROM detection_logs as dl
        LEFT JOIN devices as dv ON dl.fromDevice = dv.name
        WHERE ${condition}
        GROUP BY ${groupBy}
        ORDER BY dl.detectionTime ASC;
    `)
}

function formatVisitorSummary(
  summary,
  { dataPointType, endDate, dataPointNumber }
) {
  let resultSummary = {
    registered: [],
    guest: []
  }
  if (dataPointType === 'daily') {
    for (let i = 0; i < dataPointNumber; i++) {
      const present = new Date(endDate)
      const dateKey = format(addDays(present, i), 'yyyy-MM-dd')
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

    resultSummary.registered.sort(function(a, b) {
      return new Date(a.label) - new Date(b.label)
    })
    resultSummary.guest.sort(function(a, b) {
      return new Date(a.label) - new Date(b.label)
    })

    return resultSummary
  }

  if (dataPointType === 'weekly') {
    let resultSummary = { registered: [], guest: [] }
    for (let i = 0; i < dataPointNumber; i++) {
      const currentDate = new Date(endDate)
      const weekKey = getWeek(addWeeks(currentDate, i))
      const existWeekRecord = summary.find(record => record.label === weekKey)
      if (existWeekRecord) {
        const {
          no_user_pass,
          no_user_fail,
          total_user,
          no_stranger_pass,
          no_stranger_fail,
          total_stranger
        } = existWeekRecord
        resultSummary.registered = [
          ...resultSummary.registered,
          {
            label: weekKey,
            passed: no_user_pass,
            failed: no_user_fail,
            total: total_user
          }
        ]

        resultSummary.guest = [
          ...resultSummary.guest,
          {
            label: weekKey,
            passed: no_stranger_pass,
            failed: no_stranger_fail,
            total: total_stranger
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

    return resultSummary
  }
  if (dataPointType === 'monthly') {
    for (let i = 0; i < dataPointNumber; i++) {
      const currentDate = new Date(endDate)
      const monthKey = getMonth(addMonths(currentDate, i)) + 1
      const existMonthRecord = summary.find(
        record => record.monthKey === monthKey
      )
      if (existMonthRecord) {
        const {
          label,
          no_user_pass,
          no_user_fail,
          total_user,
          no_stranger_pass,
          no_stranger_fail,
          total_stranger
        } = existMonthRecord
        resultSummary.registered = [
          ...resultSummary.registered,
          {
            label,
            passed: no_user_pass,
            failed: no_user_fail,
            total: total_user
          }
        ]
        resultSummary.guest = [
          ...resultSummary.guest,
          {
            label: label,
            passed: no_stranger_pass,
            failed: no_stranger_fail,
            total: total_stranger
          }
        ]
      } else {
        resultSummary.registered = [
          ...resultSummary.registered,
          {
            label: months[monthKey],
            passed: 0,
            failed: 0,
            total: 0
          }
        ]
        resultSummary.guest = [
          ...resultSummary.guest,
          {
            label: months[monthKey],
            passed: 0,
            failed: 0,
            total: 0
          }
        ]
      }
    }

    resultSummary.registered = resultSummary.registered.map(
      ({ label, passed, failed, total }) => {
        return {
          label: label.substring(0, 3),
          passed,
          failed,
          total
        }
      }
    )
    resultSummary.guest = resultSummary.guest.map(
      ({ label, passed, failed, total }) => {
        return {
          label: label.substring(0, 3),
          passed,
          failed,
          total
        }
      }
    )

    return resultSummary
  }
}
