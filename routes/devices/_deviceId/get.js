import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { deviceId } = req.params
  const { name } = req.query

  validateParams({ deviceId, name })

  const [device] = await knex('devices').where('id', deviceId).where('name', name).select()

  return res.success(device)
}

function validateParams({ deviceId, name }) {
  if (!deviceId) throw new BadRequestError("deviceId not valid")
  if (!name) throw new BadRequestError("name not valid")
}