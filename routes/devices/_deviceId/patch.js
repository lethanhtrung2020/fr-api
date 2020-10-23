import knex from '@api/database.js'
import { BadRequestError } from '@helpers/ss'

export default async (req, res) => {
  const { deviceId } = req.params
  const { displayName } = req.body

  validateParams({ deviceId })

  const devices = await knex('devices').where('name', deviceId).select('id')
  const deviceIds = devices.map(device => device.id)
  await knex('devices').whereIn('id', deviceIds).update({ display_name: displayName })

  return res.success("OK")
}

function validateParams({ userId, devices }) {
  if (!deviceId) throw new BadRequestError("deviceId not valid")
}
