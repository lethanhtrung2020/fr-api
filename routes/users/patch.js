import knex from '@api/database.js'

export default async (req, res) => {
  const { userId, block_id, deviceIds } = req.body

  if (!userId) throw new BadRequestError()

  const users = await knex('users').where('userId', userId).whereIn('sn', deviceIds).select('id')
  const userIds = users.map(user => user.id)
  console.log(9,userIds );
  await knex('users').whereIn('id', userIds).update({ block_id })

  return res.success("OK")
}
