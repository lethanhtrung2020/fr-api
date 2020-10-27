import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'
export default async (req, res) => {
    // const { site } = req.body
    // await knex('site').insert(site);
    // return res.success("OK")

    try {
        await knex.transaction(async trx => {

            const { site } = req.body


            const ids = await knex('sites').insert(site, 'id').transacting(trx)

            // books.forEach(book => book.catalogue_id = ids[0])
            // await knex('books').insert(books).transacting(trx)

            console.log(inserts.length + ' new site saved.')
        })
    } catch (error) {
        console.error(error);
    }
}

function create() {
    router.post('/', async (req, res) => {
        const postData = req.body;
        try {
            const ids = await knex('sites').insert(postData);
            res.status(201).json(ids);
        } catch (err) {
            res.status(500).json({ message: "Error creating new site", error: err })
        }
    });
}