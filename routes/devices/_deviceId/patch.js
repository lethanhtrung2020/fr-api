import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { name } = req.params
  const { displayName } = req.body

  validateParams({ name })

  const devices = await knex('devices').where('name', '=', name).select('id')
  const id = devices.map(device => device.id)
  await knex('devices').whereIn('id', id).update({ display_name: displayName })

  return res.success("OK")
}

function validateParams({ name }) {
  if (!name) throw new BadRequestError("Device's name is require!")
}
