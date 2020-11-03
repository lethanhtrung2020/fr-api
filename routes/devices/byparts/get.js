import knex from '@api/database.js'

export default async (req, res) => {
  const { bId = '', cId = '', fId = '', sId = '' } = req.query;
  
  const devices = await knex('devices')
    .where(knex.raw('active = ?', 1))
    .orWhere(knex.raw('LOWER("block_id") = ?', bId))
    .orWhere(knex.raw('LOWER("floor_id") = ?', fId))
    .orWhere(knex.raw('LOWER("site_id") = ?', sId))
    .orWhere(knex.raw('LOWER("company_id") = ?', cId))
  return res.success(devices);
};
