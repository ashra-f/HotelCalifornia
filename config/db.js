// const mysql = require("mysql2");

// // Create Connection
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "ash",
//   password: "Shampoo5=Feline=Darkness",
//   database: "hotelcalifornia",
// });

// // // Create tables
// // const createTableCustomer = () => {
// //   let customerTable =
// //     "CREATE TABLE IF NOT EXISTS table_name(email varchar(25),fname varchar(25),lname varchar(25),phone varchar(64) );";

// //   connection.query(customerTable, function (err, result) {
// //     if (err) {
// //       console.log(err);
// //     }
// //     console.log("Table created");
// //   });
// // };

// // const dropTableCustomers = () => {
// //   let customerTable = "drop table IF EXISTS table_name";

// //   connection.query(customerTable, function (err, result) {
// //     if (err) {
// //       console.log(err);
// //       console.log("table does not exist");
// //     }
// //     console.log("table dropped");
// //   });
// // };

// module.exports = { connection };


const mysql = require("mysql2");
const url = require('url');

const CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL || 'mysql://ash:Shampoo5%3DFeline%3DDarkness@localhost:3306/hotelcalifornia';

const parsedUrl = new url.URL(CLEARDB_DATABASE_URL);
const hostname = parsedUrl.hostname;
const username = parsedUrl.username;
const password = parsedUrl.password;
const database = parsedUrl.pathname.substring(1); // Remove the leading "/"

// Create Connection
const connection = mysql.createConnection({
  host: hostname,
  user: username,
  password: password,
  database: database,
});

module.exports = { connection };
