require("dotenv").config();
const pool = require("./pool");

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        price DECIMAL(10,2) NOT NULL,
        picture TEXT,
        category_id INTEGER REFERENCES categories(id)
      );
    `);

    console.log("Tables created successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

createTables();
