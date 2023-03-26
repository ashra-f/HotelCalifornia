const mysql = require("mysql2");

// Create Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "ash",
  password: "Shampoo5=Feline=Darkness",
  database: "hotelcalifornia",
});

// Create tables
const createTableCustomer = () => {
  let customerTable =
    "CREATE TABLE IF NOT EXISTS table_name(email varchar(25),fname varchar(25),lname varchar(25),phone varchar(64) );";

  connection.query(customerTable, function (err, result) {
    if (err) {
      console.log(err);
    }
    console.log("Table created");
  });
};

const dropTableCustomers = () => {
  let customerTable = "drop table IF EXISTS table_name";

  connection.query(customerTable, function (err, result) {
    if (err) {
      console.log(err);
      console.log("table does not exist");
    }
    console.log("table dropped");
  });
};

// todo add create reservation
// check if room is reserved
// todo add rooms
// todo amenities
// todo reservations

module.exports = { connection, createTableCustomer, dropTableCustomers };
