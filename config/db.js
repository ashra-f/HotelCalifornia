// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mysql = require("mysql2");

// Create Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "ash",
  password: "Shampoo5=Feline=Darkness",
  database: "hotelcalifornia",
  port: 3307, // update port number to 3307
});

module.exports = connection;
