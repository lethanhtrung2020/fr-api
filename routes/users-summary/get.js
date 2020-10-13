import knex from '@api/database'
import { status, residentPrefix, guestPrefix } from '@constants/user'

export default async (req, res) => {
    const { deviceIds } = req.query

    let condition = 'WHERE `rank`=1'
    if (deviceIds && deviceIds.length) condition = condition + ` AND sn IN (${deviceIds.split(',').map(id => "'" + id + "'").join(",")})`

    const totalResidentsCondition = `
        AND card_id LIKE '${residentPrefix}%';
    `
    const presentPeoplesCondition = `
        AND status='${status.inside}'
    `
    const presentResidentsCondition = `
        AND card_id LIKE '${residentPrefix}%' 
        AND status='${status.inside}'
    `
    const presentGuestsCondition = `
        AND card_id LIKE '${guestPrefix}%' 
        AND status='${status.inside}'
    `

    const [[totalResidents]] = await knex.raw(getUniqQuery('totalResidents') + condition + totalResidentsCondition)
    const [[presentPeoples]] = await knex.raw(getUniqQuery('presentPeoples') + condition + presentPeoplesCondition)
    const [[presentResidents]] = await knex.raw(getUniqQuery('presentResidents') + condition + presentResidentsCondition)
    const [[presentGuests]] = await knex.raw(getUniqQuery('presentGuests') + condition + presentGuestsCondition)

    return res.success({ ...totalResidents, ...presentPeoples, ...presentResidents, ...presentGuests })
}

function getUniqQuery(column) {
    return `
        WITH user_sort_by_time AS (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY updatedAt DESC) AS 'rank'
            FROM users AS user
        )
        SELECT COUNT(*) as ${column}
        FROM user_sort_by_time
    `
}