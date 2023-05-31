process.env.NODE_ENV = 'test'

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testInv, testComp;
beforeEach(async () => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('90210', 'InCali', 'This is a test company') RETURNING code, name, description`)
    testComp = compResult.rows[0]

    const invResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES (90210, 10000) RETURNING id, comp_code, amt`);
    testInv = invResult.rows[0]
})

afterEach(async () => {
    await db.query('DELETE FROM invoices')
    await db.query('DELETE FROM companies')
})

afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
   test("Get a list with one invoice", async () => {
     const res = await request(app).get('/invoices')
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual({ invoices: [{id:testInv.id, comp_code:testComp.code}]})
   })
})

describe("GET /invoices/:id", () => {
   test("Get a single invoice", async () => {
      const res = await request(app).get(`/invoices/${testInv.id}`)
      testInv["invoices"] = []
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ invoice: {id: testInv.id, amt: 10000, add_date: expect.any(String),
      paid: false, paid_date: null, company: {code: testComp.code, name: testComp.name, description: testComp.description}}})
   })
})

describe("POST /invoices", () => {
   test("Creates an invoice", async () => {
      const res = await request(app).post('/invoices').send({ id: 1, comp_code: 90210, amt: 10000  })
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ invoice: { id: expect.any(Number), comp_code: testComp.code, amt: 10000, paid: false, paid_date: null, add_date: expect.any(String) }})
   })
})

describe("PUT /invoices/:id", () => {
   test("Updates a single invoice", async () => {
     const res = await request(app).put(`/invoices/${testInv.id}`).send({ paid: true, amt: 10001 })
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual({ invoice: { id: testInv.id, comp_code: "90210", amt: 10001, paid: true, paid_date: expect.any(String), add_date: expect.any(String) }})
   })
})
test("Responds with 404 for invalid id", async () => {
    const res = await request(app).put(`/invoices/0`).send({ paid: true, amt: 10000 })
    expect(res.statusCode).toBe(404);
})

describe("DELETE /invoices/:id", () => {
    test("Deletes a single invoice", async () => {
      const res = await request(app).delete(`/invoices/${testInv.id}`);
      console.log(res.body)
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'deleted' })
      console.log(res.body)
  })
})
