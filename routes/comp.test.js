process.env.NODE_ENV = 'test'

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testComp;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (name, description) VALUES ('Nike', 'footwear') RETURNING id, name, description`)
    testComp = result.rows[0]
})

afterEach(async () => {
    await db.query('DELETE FROM companies')
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", () => {
   test("Get a list with one company", async () => {
     const res = await request(app).get('/companies')
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual({ companies: [testComp]})
   })
})

describe("GET /companies/:code", () => {
   test("Get a single company", async () => {
      const res = await request(app).get(`/companies/${testComp.code}`)
      expect(statusCode).toBe(200);
      expect(res.body).toEqual({ company: [testComp]})
   })
})

describe("POST /companies", () => {
   test("Creates a company", async () => {
      const res = (await request(app).post('/companies')).send({ name: 'Nike', description: 'footwear' })
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ company: { code: testComp.code, name: "Nike", description: 'footwear' }})
   })
})

describe("PATCH /companies/:code", () => {
   test("Updates a single company", async () => {
     const res = await request(app).patch(`/companies/${testComp.code}`).send({ name: 'Nike', description: 'footwear' })
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual({ company: { code: testComp.code, name: 'Nike', description: 'footwear' }})
   })
})
test("Responds with 404 for invalid id", async () => {
    const res = await request(app).patch('/companies/0').send({ name: 'Nike', description: 'footwear' })
    expect(res.statusCode).toBe(404);
})

describe("DELETE /companies/:code", () => {
    test("Deletes a single user", async () => {
      const res = await request(app).delete(`/companies/${testComp.code}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'deleted' })
  })
})
