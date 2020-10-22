import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'

export default async (req, res) => {
  const { type, userId, bodyTemp, roomTemp, confidence, time } = req.body

  await knex('data').insert({ type: type, userid: userId, bodytemperature: bodyTemp, roomtemperature: roomTemp, confidence: confidence, time: time, active: 1, created_date: knex.fn.now(),  updated_date: knex.fn.now() });

  return res.success("OK")
}
