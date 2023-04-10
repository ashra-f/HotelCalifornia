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

async function insertRoomImgs() {
  const roomImgs = [    [1, 'single1-1.jpeg'],
    [1, 'single1-2.jpeg'],
    [1, 'single1-3.jpeg'],
    [1, 'single1-4.jpeg'],
    [1, 'single1-5.jpeg'],
    [2, 'single2-1.jpeg'],
    [2, 'single2-2.jpeg'],
    [2, 'single2-3.jpeg'],
    [2, 'single2-4.jpeg'],
    [2, 'single2-5.jpeg'],
    [3, 'single3-1.jpeg'],
    [3, 'single3-2.jpeg'],
    [3, 'single3-3.jpeg'],
    [3, 'single3-4.jpeg'],
    [3, 'single3-5.jpeg'],
    [4, 'double1-1.jpeg'],
    [4, 'double1-2.jpeg'],
    [4, 'double1-3.jpeg'],
    [4, 'double1-4.jpeg'],
    [4, 'double1-5.jpeg'],
    [5, 'double2-1.jpeg'],
    [5, 'double2-2.jpeg'],
    [5, 'double2-3.jpeg'],
    [5, 'double2-4.jpeg'],
    [5, 'double2-5.jpeg'],
    [6, 'double3-1.jpeg'],
    [6, 'double3-2.jpeg'],
    [6, 'double3-3.jpeg'],
    [6, 'double3-4.jpeg'],
    [6, 'double3-5.jpeg'],
    [7, 'suite1-1.jpeg'],
    [7, 'suite1-2.jpeg'],
    [7, 'suite1-3.jpeg'],
    [7, 'suite1-4.jpeg'],
    [7, 'suite1-5.jpeg'],
    [8, 'suite2-1.jpeg'],
    [8, 'suite2-2.jpeg'],
    [8, 'suite2-3.jpeg'],
    [8, 'suite2-4.jpeg'],
    [8, 'suite2-5.jpeg'],
    [9, 'suite3-1.jpeg'],
    [9, 'suite3-2.jpeg'],
    [9, 'suite3-3.jpeg'],
    [9, 'suite3-4.jpeg'],
    [9, 'suite3-5.jpeg'],
    [10, 'conference1-1.jpeg'],
    [10, 'conference1-2.jpeg'],
    [10, 'conference1-3.jpeg'],
    [10, 'conference1-4.jpeg'],
    [10, 'conference1-5.jpeg'],
    [11, 'conference2-1.jpeg'],
    [11, 'conference2-2.jpeg'],
    [11, 'conference2-3.jpeg'],
    [11, 'conference2-4.jpeg'],
    [11, 'conference2-5.jpeg'],
    [12, 'conference3-1.jpeg'],
    [12, 'conference3-2.jpeg'],
    [12, 'conference3-3.jpeg'],
    [12, 'conference3-4.jpeg'],
    [12, 'conference3-5.jpeg']
  ];
  
  const queryString = 'INSERT INTO `room_imgs` (`roomId`, `img_url`) VALUES ?';

  try {
    const result = await pool.query(queryString, [roomImgs]);
    console.log('Inserted room images successfully');
  } catch (err) {
    console.error(err);
  }
}

const insertAmenities = async (amenities) => {
  const placeholders = amenities.map((amenity) => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
  const values = amenities.reduce((acc, curr) => acc.concat(Object.values(curr)), []);
  const query = `INSERT INTO amenities (roomId, smoke, tv, free_wifi, minifridge, gym, pets, breakfast) VALUES ${placeholders}`;
  try {
    const result = await db.query(query, values);
    console.log(`Inserted ${result.affectedRows} rows`);
  } catch (err) {
    console.error(err);
  }
};

function insertRoomsData() {
  const query = 'INSERT INTO rooms (roomId, description, size, price_per_night, max_guests, availability) VALUES ?';
  const values = roomsData.map(room => [room.roomId, room.description, room.size, room.price_per_night, room.max_guests, room.availability]);

  pool.query(query, [values], (err, results) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Rooms data inserted successfully');
  });
}


module.exports = {
  createAmenitiesTable,
  createCustomersTable,
  createReservationsTable,
  createRoomsTable,
  createRoomImgsTable,
  insertRoomImgs,
  insertAmenities,
  insertRoomsData,
  connection
};
