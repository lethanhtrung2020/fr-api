import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { userId } = req.params
  const { device } = req.query

  validateParams({ userId, device })

  const [user] = await knex('users').where('userId', userId).where('sn', device).select()

  return res.success(user)
}

function validateParams({ userId, device }) {
  if (!userId) throw new BadRequestError("userId not valid")
  if (!device) throw new BadRequestError("device not valid")
}
