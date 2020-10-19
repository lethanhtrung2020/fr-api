import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { device, page=1, pageSize=15 } = req.query

  validateParams({  device })
  const offset = (page-1)*pageSize

  // const users = await knex('users').where('sn', device).offset(offset).limit(pageSize).select()
  const lstUsers = await knex.select("u.*", "b.name as block_name", "c.name as company_name", "f.name as floor_name", "s.name as site_name")
  .from("users as u")
  .leftJoin("blocks as b", function() {
    this.on("b.id", "=", "u.block_id")
  })
  .leftJoin("companies as c", function() {
    this.on("c.id", "=", "u.company_id")
  })
  .leftJoin("floors as f", function() {
    this.on("f.id", "=", "u.floor_id")
  })
  .leftJoin("sites as s", function() {
    this.on("s.id", "=", "u.site_id")
  })
  .where("u.sn", device).offset(offset).limit(pageSize);

  return res.success(lstUsers)
}

function validateParams({  device }) {
  if (!device) throw new BadRequestError("device not valid")
}
