import knex from '@api/database.js'

export default async (res) => {
  const blocks = await knex('blocks').select('id', 'name', 'description').whereRaw('?? = ??', ['active', 1]);
  return res.success(blocks);
}
