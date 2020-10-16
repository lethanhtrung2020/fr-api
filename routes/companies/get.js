import knex from '@api/database.js'

export default async (req, res) => {
  const companies = await knex.select('id', 'short_name', 'name', 'description').from('companies').where('active', '=', 1)
  // .then(data => console.log(data))
  return res.success(companies)
}
