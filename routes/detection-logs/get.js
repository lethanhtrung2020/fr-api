import knex from '@api/database'

export default async (req, res) => {
    const xxx = await knex('detection_logs').limit(1).select()
    return res.success(xxx)
}
