const mysql = require('mysql2/promise');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'ratings_reviews',
});

module.exports = connection;
