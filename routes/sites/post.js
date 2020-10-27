import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'
export default async (req, res) => {
    try {
        const { site } = req.body
         console.log('site: ' + JSON.stringify(site));
        await knex('site').insert(site);
        return res.success("OK")
        // Using trx as a transaction object:
        // const trx = await knex.transaction();
        // const { site } = req.body
       
        // trx('sites').insert(site, 'id')
        // .then(function(id) {
        //     console.log('New site saved: ' + id)
        //     return res.success("OK")
        // })
        // .then(trx.commit)
        // .catch(trx.rollback);
        // await knex.transaction(async trx => {

        
        //     const id = await knex('sites').insert(site, 'id').transacting(trx)
        //     console.log('New site saved: ' + id)
        //     return res.success("OK")
        // })
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