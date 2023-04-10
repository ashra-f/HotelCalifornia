// const mysql = require("mysql2");

// // Create Connection
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "ash",
//   password: "Shampoo5=Feline=Darkness",
//   database: "hotelcalifornia",
// });

// module.exports = { connection };


const mysql = require("mysql2");
const url = require('url');
const util = require('util');

const CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL;

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


// Add your connection code here
const query = util.promisify(connection.query).bind(connection);

async function createAmenitiesTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS amenities (
      roomId int(11) NOT NULL,
      smoke tinyint(1) NOT NULL,
      tv tinyint(1) NOT NULL,
      free_wifi tinyint(1) NOT NULL,
      minifridge tinyint(1) NOT NULL,
      gym tinyint(1) NOT NULL,
      pets tinyint(1) NOT NULL,
      breakfast tinyint(1) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
  await query(sql);
}

async function createCustomersTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS customers (
      email varchar(64) NOT NULL,
      fname varchar(25) NOT NULL,
      lname varchar(25) NOT NULL,
      password varchar(100) NOT NULL,
      phone varchar(25) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
  await query(sql);
}

async function createReservationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS reservations (
      roomId int(11) NOT NULL,
      email varchar(64) NOT NULL,
      totalPayment int(11) NOT NULL,
      cc_num varchar(16) NOT NULL,
      check_in_date date NOT NULL,
      check_out_date date NOT NULL,
      total_guests int(2) NOT NULL,
      stat varchar(11) NOT NULL,
      time timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
  await query(sql);
}

async function createRoomsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS rooms (
      roomId int(64) NOT NULL,
      description text NOT NULL,
      size varchar(32) NOT NULL,
      price_per_night int(11) NOT NULL,
      max_guests int(11) NOT NULL,
      availability varchar(18) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
  await query(sql);
}

async function createRoomImgsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS room_imgs (
      roomId int(11) NOT NULL,
      img_url varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
  await query(sql);
}

module.exports = {
  createAmenitiesTable,
  createCustomersTable,
  createReservationsTable,
  createRoomsTable,
  createRoomImgsTable,
  connection
};

module.exports.parsedUrl = parsedUrl;
