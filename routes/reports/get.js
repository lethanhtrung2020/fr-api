import knex from '@api/database.js'
import moment from 'moment'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const {device, type='', sd='', ed='', temp = '', site='', block='', floor='', comp='', page=1, pageSize=15 } = req.query
  validateParams({  device })
  const offset = (page-1)*pageSize
  const  strSD = !sd ? moment().subtract(6, 'days').format('YYYY-MM-DD 00:00') : sd;
  const  strED = !ed ? moment().format('YYYY-MM-DD 00:00') : ed;
  
  const lstReports = await knex.select("l.*", "u.name", "u.icCard", "u.phone", "d.block_id", "d.company_id", "d.floor_id", "d.site_id", "d.type as dev_type", "d.custom_name as dev_name", "b.name as block_name", "c.name as company_name", "f.name as floor_name", "s.name as site_name")
  .from("detection_logs as l")
  
  .leftJoin("users as u", function() {
    this.on("l.userId", "u.userId"),
    this.on("u.sn", device.toString()),
    this.on("u.active", 1)
  })
  .leftJoin("devices as d", function() {
    this.on("l.fromDevice", "d.name"),
    this.on("d.active", 1)
  })
  .leftJoin("blocks as b", function() {
    this.on("b.short_name", "d.block_id"),
    this.on("b.active", 1)
  })
  .leftJoin("companies as c", function() {
    this.on("c.short_name", "d.company_id"),
    this.on("c.active", 1)
  })
  .leftJoin("floors as f", function() {
    this.on("f.short_name", "d.floor_id"),
    this.on("f.active", 1)
  })
  .leftJoin("sites as s", function() {
    this.on("s.short_name", "d.site_id"),
    this.on("s.active", 1)
  })
  .where('l.type', 'like', `%${String(type).toUpperCase()}%`).where('l.fromDevice', device).where('d.site_id', 'like', `%${site}%`).where('d.block_id', 'like', `%${block}%`).where('d.floor_id', 'like', `%${floor}%`).where('d.company_id', 'like', `%${comp}%`).whereRaw('date_format(detectionTime, \'%Y-%m-%d  %H:%i\') between cast(\''+strSD.toString()+'\' as datetime) and cast(\''+strED.toString()+'\' as datetime)').orderBy('l.detectionTime', 'desc;').offset(offset);
  return res.success(lstReports)
}

function validateParams({  device }) {
  if (!device) throw new BadRequestError("Device not valid")
}
