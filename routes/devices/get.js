import knex from '@api/database.js'

export default async (req, res) => {
  const { deviceIds, page = 1, pageSize = 15 } = req.query;

  const offset = (page - 1) * pageSize
  let query = knex("devices")
    .leftJoin("blocks", "blocks.short_name", "devices.block_id")
    .leftJoin("sites", "sites.short_name", "devices.site_id")
    .leftJoin("floors", "floors.short_name", "devices.floor_id")
    .leftJoin("companies", "companies.short_name", "devices.company_id")
  if (deviceIds) {
    const ids = deviceIds.split(",")
    query = query.whereIn("devices.name", ids)
  }

  const devices = await query.offset(offset).limit(pageSize).select(
    "devices.id",
    "devices.name",
    "devices.display_name",
    "devices.block_id",
    "devices.site_id",
    "devices.floor_id",
    "devices.company_id",
    "blocks.name as blockName",
    "sites.name as siteName",
    "floors.name as floorName",
    "companies.name as companyName"
  )

  return res.success(devices);
};
