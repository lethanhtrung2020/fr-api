import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { device, page=1, pageSize=15 } = req.query

  validateParams({  device })
  const offset = (page-1)*pageSize

  // const users = await knex('users').where('sn', device).offset(offset).limit(pageSize).select()
  // const lstUsers = await knex
  //   .select('*')
  //   .from(function () {
  //       this.select('*').from('users')
  //       .where('sn', device)
  //       .offset(offset)
  //       .limit(pageSize)
  //       .as('u');
  //   })
  //   .leftJoin(
  //       knex('blocks').as('b'), 
  //       function () {
  //             this.on('u.block_id', '=', 'b.id');
  //       }
  //   );
  knex.select('u.*, b.`name` as block_name').from('users').as('u').leftJoin('blocks as b', function() {
    this.on('b.id', '=', 'u.block_id')
  })

  // const superJoinData = await knex(
  //       knex<Process>('users')
  //       .select([
  //           'processes.id as processId',
  //           'processes.name as processName', //--- conflict with rs.name
  //           'processes.description as processDescription', //-- conflict with rs.description
  //           'processes.deleted as processDeleted',
  //           'processes.deleteTime as processDeleteTime',
  //           'rsp.runningSettingId',
  //           'rsp.value as settingValue',
  //           'rsp.startTime as settingStartTime'
  //       ])
  //       .leftJoin(
  //           'blocks as b',
  //           'processes.id',
  //           'rsp.processId'
  //       )//_______________________to here 
  //       .as('users') //            |first join. (result an equivalent of a table)
  //   ) // !!!!!!!!!!!!!!!!! notice how we nested a knex construct within another!!
  //   .select([ // select from the resulting table of the first join !!!!
  //       'prsp.processId',
  //       'prsp.processName',
  //       'prsp.processDescription',
  //       'prsp.processDeleted',
  //       'prsp.processDeleteTime',
  //       'prsp.runningSettingId',
  //       'prsp.settingValue',
  //       'prsp.settingStartTime',
  //       'rs.name as settingName',
  //       'rs.description as settingDescription'
  //   ])
  //   .innerJoin( // ______________second inner join
  //       'runningSettings as rs',
  //       'prsp.runningSettingId',
  //       'rs.id'
  //   );

  return res.success(lstUsers)
}

function validateParams({  device }) {
  if (!device) throw new BadRequestError("device not valid")
}
