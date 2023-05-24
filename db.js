/** Database setup for BizTime. */

const { Client } = require('pg')

const DB_URI = (process.env.NODE_ENV === 'test')

const client = new Client({connectionString: "postgresql:///biztime"
});

client.connect();

module.exports = client;
