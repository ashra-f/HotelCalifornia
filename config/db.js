const mysql = require('mysql2');
const url = require('url');

const CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL;

const parsedUrl = new url.URL(CLEARDB_DATABASE_URL);
const hostname = parsedUrl.hostname;
const username = parsedUrl.username;
const password = parsedUrl.password;
const database = parsedUrl.pathname.substring(1); // Remove the leading "/"

// Create a connection pool
const pool = mysql.createPool({
  host: hostname,
  user: username,
  password: password,
  database: database,
});

module.exports = {
  pool
};


// const mysql = require("mysql2");
// const url = require('url');

// const CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL;

// const parsedUrl = new url.URL(CLEARDB_DATABASE_URL);
// const hostname = parsedUrl.hostname;
// const username = parsedUrl.username;
// const password = parsedUrl.password;
// const database = parsedUrl.pathname.substring(1); // Remove the leading "/"

// // Create Connection
// const connection = mysql.createConnection({
//   host: hostname,
//   user: username,
//   password: password,
//   database: database,
// });

// module.exports = {
//   connection
// };


// const mysql = require("mysql2");

// // Create Connection
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "ash",
//   password: "Shampoo5=Feline=Darkness",
//   database: "hotelcalifornia",
// });

// module.exports = { connection };