import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { deviceIds } = req.query

  validateParams({ deviceIds })

  const ids = deviceIds.split(',')
  const devices = await knex('devices').whereIn('name', ids).select('id', 'name', 'display_name')

  return res.success(devices)
}

function validateParams({ deviceIds }) {
    if (!deviceIds) throw new BadRequestError("deviceIds not valid")
    const deviceIdInArray = deviceIds.split(',')
    if (!deviceIdInArray.length) throw new BadRequestError("Cannot convert deviceIds to array")
}
