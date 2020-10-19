import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { device, page=1, pageSize=15 } = req.query

  validateParams({  device })
  const offset = (page-1)*pageSize

  // const users = await knex('users').where('sn', device).offset(offset).limit(pageSize).select()
  const lstUsers = await knex
    .select('u.*, b.`name` as block_name')
    .from(function () {
        this.select('*').from('users')
        .where('sn', device)
        .offset(offset)
        .limit(pageSize)
        .as('u');
    })
    .leftJoin(
        knex('blocks').as('b'), 
        function () {
              this.on('u.block_id', '=', 'b.id');
        }
    );
  // knex.select('*').from('users').leftJoin('blocks', function() {
  //   this.on('blocks.id', '=', 'users.block_id')
  // })

  return res.success(lstUsers)
}

function validateParams({  device }) {
  if (!device) throw new BadRequestError("device not valid")
}
