import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { type='', device, site='', block='', floor='', comp='', page=1, pageSize=15 } = req.query
  validateParams({  device })
  const offset = (page-1)*pageSize

  const lstReports = await knex.select("l.*", "u.name", "u.icCard", "u.phone", "u.block_id", "u.company_id", "u.floor_id", "u.site_id", "d.type as dev_type", "b.name as block_name", "c.name as company_name", "f.name as floor_name", "s.name as site_name")
  .from("detection_logs as l")
  .leftJoin("users as u", function() {
    this.on("l.userId", "u.userId")
  })
  .leftJoin("devices as d", function() {
    this.on("l.fromDevice", "d.name")
  })
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
  .where('l.type', 'like', `%${String(type).toUpperCase()}%`).where('l.fromDevice', device).where('u.site_id', 'like', `%${site}%`).where('u.block_id', 'like', `%${block}%`).where('u.floor_id', 'like', `%${floor}%`).where('u.company_id', 'like', `%${comp}%`).offset(offset);
  // .limit(pageSize)

  return res.success(lstReports)
}

function validateParams({  device }) {
  if (!device) throw new BadRequestError("Device not valid")
}
