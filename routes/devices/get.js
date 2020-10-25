import knex from '@api/database.js'

export default async (req, res) => {
  const { deviceIds, page = 1, pageSize = 15 } = req.query;

  const offset = (page - 1) * pageSize
  let query = knex("devices")
  if (deviceIds) {
    const ids = deviceIds.split(",")
    query = query.whereIn("name", ids)
  }

  const devices = await query.offset(offset).limit(pageSize).select("id", "name", "display_name", "block_id", "site_id", "floor_id", "company_id")

  return res.success(devices);
};
