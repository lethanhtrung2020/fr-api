import knex from '@api/database.js'

export default async (res) => {
  const blocks = () => knex('blocks')
  return blocks().where('active', '=', 1)
  // const blocks = await knex('blocks').select('id', 'name', 'description').whereRaw('?? = ??', ['active', 1])
  // return res.success(blocks)
  // return knex('blocks').select('id', 'name', 'description').where('active', 1)
    // .then(function (records) {
      // already returns an array you can do other things here
      // return records;
    // })
}
