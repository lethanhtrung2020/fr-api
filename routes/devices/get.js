import knex from '@api/database.js'

export default async (req, res) => {
  const { deviceIds, page = 1, pageSize = 15 } = req.query;

  const offset = (page - 1) * pageSize
  let query = knex("devices")
    .leftJoin("blocks", "blocks.short_name", "devices.block_id")
    .leftJoin("sites", "sites.short_name", "devices.site_id")
    .leftJoin("floors", "floors.short_name", "devices.floor_id")
  if (deviceIds) {
    const ids = deviceIds.split(",")
    query = query.whereIn("devices.name", ids)
  }

  const devices = await query.offset(offset).limit(pageSize).select(
    "devices.id",
	"devices.type",
    "devices.name",
    "devices.display_name",
    "devices.block_id",
    "devices.site_id",
    "devices.floor_id",
    "devices.custom_name",
    "blocks.name as blockName",
    "sites.name as siteName",
    "floors.name as floorName",
  ).where('sites.active', '=', 1).where('blocks.active', '=', 1)where('floors.active', '=', 1)

  return res.success(devices);
};
