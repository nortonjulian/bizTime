process.env.NODE_ENV = 'test'

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testInv;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO invoices (id, comp_code) VALUES (813, 90210) RETURNING id, comp_code`)
    testComp = result.rows[0]
})

afterEach(async () => {
    await db.query('DELETE FROM invoices')
})

afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
   test("Get a list with one invoice", async () => {
     const res = await request(app).get('/invoices')
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual({ invoices: [testInv]})
   })
})

describe("GET /invoices/:id", () => {
   test("Get a single invoice", async () => {
      const res = await request(app).get(`/invoices/${testInv.id}`)
      testInv["invoices"] = []
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ invoice: testInv })
   })
})

describe("POST /invoices", () => {
   test("Creates an invoice", async () => {
      const res = await request(app).post('/invoices').send({ comp_code: 90210, amt: 10000 })
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ invoice: { comp_code: 90210, amt: 10000}})
   })
})

describe("PUT/invoices/:id", () => {
   test("Updates a single invoice", async () => {
     const res = await request(app).patch(`/invoices/${testInv.id}`).send({ comp_code: 90210, amt: 10000 })
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual({ invoice: { id: testInv.id, comp_code: 90210, amt: 10000 }})
   })
})
test("Responds with 404 for invalid id", async () => {
    const res = await request(app).patch(`/invoices/0`).send({ comp_code: 90210, amt: 10000 })
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
