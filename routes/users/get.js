import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { device, site='', block='', floor='', comp='', fin_month = 0, page=1, pageSize=15 } = req.query
  validateParams({  device })
  const offset = (page-1)*pageSize
  const date_diff = fin_month * 30;
  const sfilter = 'DATEDIFF(u.icCard_Expiry, now())>' . date_diff
  
  // const users = await knex('users').where('sn', device).offset(offset).limit(pageSize).select()
  const lstUsers = await knex.select("u.*", "b.name as block_name", "c.name as company_name", "f.name as floor_name", "s.name as site_name")
  .from("users as u")
  .leftJoin("blocks as b", function() {
    this.on("b.short_name", "=", "u.block_id")
  })
  .leftJoin("companies as c", function() {
    this.on("c.short_name", "=", "u.company_id")
  })
  .leftJoin("floors as f", function() {
    this.on("f.short_name", "=", "u.floor_id")
  })
  .leftJoin("sites as s", function() {
    this.on("s.short_name", "=", "u.site_id")
  })
  .where('u.sn', device).where('u.site_id', 'like', `%${site}%`).where('u.block_id', 'like', `%${block}%`).where('u.floor_id', 'like', `%${floor}%`).where('u.company_id', 'like', `%${comp}%`).where(knex.raw(sfilter)).offset(offset).limit(pageSize);

  return res.success(lstUsers)
}

function validateParams({  device }) {
  if (!device) throw new BadRequestError("Device not valid")
}
