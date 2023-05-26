const express = require("express")
const slugify = require('slugify')
const db = require("../db")
const ExpressError = require("../expressError")

let router = new express.Router();

router.get('/', async (req, res, next) => {
   try {
    const result = await db.query(`SELECT code, description, name FROM companies ORDER BY name`)
    return res.json({"companies": result.rows})
   }
   catch (err) {
    return next(err)
   }
})

router.get('/:code', async (req, res, next) => {
    try {
        let code = req.params.code;
        const compRes = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code])
        const invRes = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code])

        if (compRes.rows.length === 0) {
            throw new ExpressError(`Can't find company with a code of ${code}`, 404)
        }

        const company = compRes.rows[0]
        const invoices = invRes.rows

        company.invoices = invoices.map(inv => inv.id);

        return res.json({"company": company})
    } catch (err) {
        return next(err)
    }
})

router.post('/', async (req, res, next) => {
    try {
        let { name, description } = req.body
        let code = slugify(name, {lower: true})

        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);

        return res.status(201).json({ "company": results.rows[0]})
    } catch (err) {
        return next(err)
    }
});

router.patch('/:code', async (req, res, next) => {
    try {
        let { name, description } = req.body
        let code  = req.params.code

        const result = await db.query(`UPDATE companies SET name=$1,
                                    description=$2 WHERE code=$3
                                    RETURNING code, name, description`, [name, description, code])

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with a code of ${code}`, 404)
        }
        return res.json({ company: result.rows[0] })
    } catch (err) {
        return next(err)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const result = await db.query("DELETE FROM companies WHERE code = $1 RETURNING code", [req.params.code]);
        return res.json({status: "deleted"})
    } catch (err) {
        return next(err)
    }
})

module.exports = router;
