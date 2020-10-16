import knex from '@api/database.js'

export default async (req, res) => {
  const floors = await knex.select('id', 'short_name', 'name', 'description').from('floors').where('active', '=', 1)
  // .then(data => console.log(data))
  return res.success(floors)
}
