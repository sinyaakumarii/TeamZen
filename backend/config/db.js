// config/db.js
// This file creates a connection pool to our MySQL database.
// A "pool" means multiple connections are ready to use, instead of opening/closing one each time — faster and more reliable.

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Use the promise-based version so we can use async/await later
const promisePool = pool.promise();

module.exports = promisePool;