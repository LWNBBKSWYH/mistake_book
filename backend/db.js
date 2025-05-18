// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'mistake_book',
});

// 使用 promise API
module.exports = pool.promise();
