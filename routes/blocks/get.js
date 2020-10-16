import knex from '@api/database.js'

export default async () => {
  await knex.select('id', 'name', 'description').from('blocks').where('active', '=', 1)
    .then(data => console.log(data));
}
