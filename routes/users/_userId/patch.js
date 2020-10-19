import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { userId } = req.params
  const { devices } = req.query
  const { blockId, companyId, siteId, floorId, cardId } = req.body

  validateParams({ userId, devices })
  const deviceIds = devices.split(",")

  const users = await knex('users').where('userId', userId).whereIn('sn', deviceIds).select('id')
  const userIds = users.map(user => user.id)
  await knex('users').whereIn('id', userIds).update({ block_id: blockId, company_id: companyId, site_id: siteId, floor_id: floorId, card_id: cardId })

  return res.success("OK")
}

function validateParams({ userId, devices }) {
  if (!userId) throw new BadRequestError("userId not valid")
  if (!devices) throw new BadRequestError("devices in query not valid")

  const devicesArray = devices.split(',')
  if (!devicesArray.length) throw new BadRequestError("Cannot convert devices to array")
}
