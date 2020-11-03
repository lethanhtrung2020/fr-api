import knex from '@api/database.js'

export default async (req, res) => {
  const { bId = '', cId = '', fId = '', sId = '' } = req.query;
  
  const devices = await knex('devices')
  .where(knex.raw('active = ?', 1))
  .orWhere(knex.raw('LOWER("block_id") = ?', bId))
  .orWhere(knex.raw('LOWER("floor_id") = ?', fId))
  .orWhere(knex.raw('LOWER("site_id") = ?', sId))
  // knex({ d: 'devices' })
  // .select('*')
  // .where('d.active',  1)
  // .whereRaw('d.site_id = ?', [sId.toString()])

  // const devices = await knex('devices')
  //   .whereRaw('block_id = ?', [bId])
  //   .whereRaw('company_id = ?', [cId])
  //   .whereRaw('floor_id = ?', [fId])
  //   .whereRaw('site_id = ?', [sId.toString()])
  //   .andWhere('active',  1)
  // .join(knex.raw('natural full join blocks')).where('short_name', bId).andWhere().andWhere('active',  1)
  // let query = knex("d.*")
  //   .from("devices as d")
  //   .innerJoin("blocks as b", function() {
  //     this.on("b.short_name", bId),
  //     this.on("b.active", 1)
  //   })
  //   .innerJoin("companies as c", function() {
  //     this.on("c.short_name", cId),
  //     this.on("c.active", 1)
  //   })
  //   .innerJoin("floors as f", function() {
  //     this.on("f.short_name", fId),
  //     this.on("f.active", 1)
  //   })
  //   .innerJoin("sites as s", function() {
  //     this.on("s.short_name", sId),
  //     this.on("s.active", 1)
  //   })
  //   .innerJoin("blocks", "blocks.short_name", bId)
  //   .innerJoin("companies", "companies.short_name", cId)
  //   .innerJoin("floors", "floors.short_name", fId)
  //   .innerJoin("sites", "sites.short_name", sId)
  
  // const devices = await query.select(
  //   "devices.id",
	//   "devices.type",
  //   "devices.name",
  //   "devices.display_name",
  //   "devices.block_id",
  //   "devices.site_id",
  //   "devices.floor_id",
  //   "devices.custom_name",
  //   "blocks.name as blockName",
  //   "sites.name as siteName",
  //   "floors.name as floorName",
  // ).where('sites.active', '=', 1).where('blocks.active', 1).where('floors.active', 1).where('companies.active', 1)

  return res.success(devices);
};
