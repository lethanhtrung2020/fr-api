import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { id } = req.params

  validateParams({ id })

  const sites = await knex('sites').where('id', id).select('id')
  const id = sites.map(site => site.id)
  await knex('sites').where('id', id).update({ active: 0, created_date: knex.fn.now(),  updated_date: knex.fn.now() })

  return res.success("OK");
}

function validateParams({ id, shortName }) {
  if (!id) throw new BadRequestError("Id not valid");
}
