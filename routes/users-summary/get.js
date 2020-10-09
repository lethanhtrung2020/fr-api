import knex from '@api/database'
import { type, residentPrefix } from '@constants/user'

export default async (req, res) => {
    const [[userSummary]] = await knex.raw(`
        SELECT * FROM (
            (SELECT COUNT(*) as totalResidents FROM fr_db.users WHERE userId NOT LIKE '${residentPrefix}%') as totalResidents,
            (SELECT COUNT(*) as presentPeoples FROM fr_db.users WHERE type='${type.inside}')  as presentPeoples,
            (SELECT COUNT(*) as presentResidents FROM fr_db.users WHERE userId NOT LIKE '${residentPrefix}%' AND type='${type.inside}')  as presentResidents,
            (SELECT COUNT(*) as presentGuests FROM fr_db.users WHERE userId LIKE '${residentPrefix}%' AND type='${type.inside}')  as presentGuests
        );
    `)

    return res.success(userSummary)
}
