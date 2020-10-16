import knex from '@api/database.js'

export default async (req, res) => {
  const blocks = await knex.select('id', 'name', 'description').from('blocks').where('active', '=', 1)
    .then(data => console.log(data))
  return res.success(blocks)
}
