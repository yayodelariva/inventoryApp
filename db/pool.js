require("dotenv").config();
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
