import knex from '@api/database.js'
import { BadRequestError } from '@helpers/errors'
export default async (req, res) => {
    try {
        const trx = await knex.transaction();
        const { sn, name, desc } = req.body;
       
        trx('blocks').insert({short_name: sn, name: name, description: desc , active: 1, created_date: knex.fn.now(),  updated_date: knex.fn.now()}, 'id')
        .then(function(id) {
            // console.log('New site saved: ' + id)
            return res.success("OK")
        })
        .then(trx.commit)
        .catch(trx.rollback);
    } catch (error) {
        console.error(error);
    }
}

function create() {
    router.post('/', async (req, res) => {
        const postData = req.body;
        try {
            const ids = await knex('blocks').insert(postData);
            res.status(201).json(ids);
        } catch (err) {
            res.status(500).json({ message: "Error creating new block", error: err })
        }
    });
}