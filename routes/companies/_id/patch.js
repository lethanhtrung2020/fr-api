import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { id } = req.params
  const { sn } = req.query
  const { shortName, name, description } = req.body

  validateParams({ id, sn });

  await knex('companies').where('id', id).where('short_name', sn).update({ short_name: shortName, name: name, description: description, created_date: knex.fn.now(),  updated_date: knex.fn.now() })

  return res.success("OK");
}

function validateParams({ id, sn }) {
  if (!id) throw new BadRequestError("Id not valid");
  if (!sn) throw new BadRequestError("Short name in query not valid");
}
