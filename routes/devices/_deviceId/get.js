import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { name } = req.params

  validateParams({ name })

  const [device] = await knex('devices').where('name', name).select()

  return res.success(device)
}

function validateParams({ name }) {
  if (!name) throw new BadRequestError("Device's name is require!")
}
