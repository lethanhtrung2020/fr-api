import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { device, page=1, pageSize=15 } = req.query

  validateParams({  device })
  const offset = (page-1)*pageSize

  const users = await knex('users').where('sn', device).offset(offset).limit(pageSize).select()

  return res.success(users)
}

function validateParams({  device }) {
  if (!device) throw new BadRequestError("device not valid")
}
