import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { deviceId } = req.params

  validateParams({ userId, device })

  const [device] = await knex('devices').where('name', deviceId).select()

  return res.success(device)
}

function validateParams({ deviceId }) {
  if (!userId) throw new BadRequestError("deviceId not valid")
}
