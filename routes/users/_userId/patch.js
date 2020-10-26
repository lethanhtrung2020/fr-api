import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { userId } = req.params
  const { devices } = req.query
  const { ic } = req.query
  const { blockId, companyId, siteId, floorId, cardId } = req.body

  validateParams({ userId, devices, ic })
  const deviceIds = devices.split(",")

  const users = await knex('users').where('userId', userId).where('icCard', ic).whereIn('sn', deviceIds).select('id')
  const userIds = users.map(user => user.id)
  await knex('users').whereIn('userId', userIds).update({ block_id: blockId, company_id: companyId, site_id: siteId, floor_id: floorId, card_id: cardId })

  return res.success("OK")
}

function validateParams({ ic, devices }) {
  if (!userId) throw new BadRequestError("User ID not valid")
  if (!devices) throw new BadRequestError("Devices in query not valid")
  if (!ic) throw new BadRequestError("IC Card not valid")

  const devicesArray = devices.split(',')
  if (!devicesArray.length) throw new BadRequestError("Cannot convert devices to array")
}
