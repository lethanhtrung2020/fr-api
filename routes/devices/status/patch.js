import knex from '@api/database.js';
import { BadRequestError } from '@helpers/errors';

export default async (req, res) => {
  const { activeDevices } = req.body;
  if (!Array.isArray(activeDevices)) throw new BadRequestError('activeDevices not valid');
  const devices = await knex.select('id', 'name', 'active').table('devices');
  devices.map(async (device) => {
    const { id, name } = device;
    if (activeDevices.includes(name)) {
      await knex('devices').where({ id }).update({ active: 1 });
    } else {
      await knex('devices').where({ id }).update({ active: 0 });
    }
  });
  return res.success('OK');
};
