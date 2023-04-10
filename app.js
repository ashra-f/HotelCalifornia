const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const session = require("express-session");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const { connection, createAmenitiesTable, createCustomersTable, createReservationsTable, createRoomsTable, createRoomImgsTable, insertAmenities, insertRoomImgs, insertRoomsData } = require("./config/db");

// Connect to database
connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected to database on port 3306`);
});

(async () => {
  await createAmenitiesTable();
  await createCustomersTable();
  await createReservationsTable();
  await createRoomsTable();
  await createRoomImgsTable();
  // await insertRoomImgs();

//   const roomsData = [
//   { roomId: 1, description: 'Indulge in the ultimate comfort and relaxation in our luxurious single bed room, featuring high-end amenities.', size: 'Standard Single', price_per_night: 50, max_guests: 1, availability: 'available' },
//   { roomId: 2, description: 'Indulge in the ultimate comfort and relaxation in our luxurious single bed room, featuring high-end amenities.', size: 'Deluxe Single', price_per_night: 75, max_guests: 1, availability: 'not available' },
//   { roomId: 3, description: 'Indulge in the ultimate comfort and relaxation in our luxurious single bed room, featuring high-end amenities.', size: 'Executive Single', price_per_night: 90, max_guests: 1, availability: 'available' },
//   { roomId: 4, description: 'Experience the height of luxury with our spacious double room, complete with stylish decor and premium amenities.', size: 'Standard Double', price_per_night: 100, max_guests: 2, availability: 'available' },
//   { roomId: 5, description: 'Experience the height of luxury with our spacious double room, complete with stylish decor and premium amenities.', size: 'Deluxe Double', price_per_night: 85, max_guests: 2, availability: 'available' },
//   { roomId: 6, description: 'Experience the height of luxury with our spacious double room, complete with stylish decor and premium amenities.', size: 'Executive Double', price_per_night: 100, max_guests: 2, availability: 'available' },
//   { roomId: 7, description: 'Escape to pure luxury with our exquisite suite, featuring a separate living area, and stunning views of the city.', size: 'Standard Suite', price_per_night: 350, max_guests: 7, availability: 'available' },
//   { roomId: 8, description: 'Escape to pure luxury with our exquisite suite, featuring a separate living area, and stunning views of the city.', size: 'Deluxe Suite', price_per_night: 400, max_guests: 7, availability: 'available' },
//   { roomId: 9, description: 'Escape to pure luxury with our exquisite suite, featuring a separate living area, and stunning views of the city.', size: 'Executive Suite', price_per_night: 450, max_guests: 7, availability: 'available' },
//   { roomId: 10, description: 'Reserve a professional conference room, complete with state-of-the-art equipment and comfortable seating to ensure success.', size: 'Standard Conference', price_per_night: 600, max_guests: 10, availability: 'available' },
//   { roomId: 11, description: 'Reserve a professional conference room, complete with state-of-the-art equipment and comfortable seating to ensure success.', size: 'Deluxe Conference', price_per_night: 650, max_guests: 10, availability: 'available' },
//   { roomId: 12, description: 'Reserve a professional conference room, complete with state-of-the-art equipment and comfortable seating to ensure success.', size: 'Executive Conference', price_per_night: 700, max_guests: 10, availability: 'available' },
// ];


//   await insertRoomsData(roomsData);
  // await insertAmenities(amenitiesData);
})().catch((err) => {
  console.error("Error creating tables:", err);
});

const app = express();

// Sessions
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "flying dolphin agent 47",
    resave: false,
    cookie: { maxAge: oneDay },
    saveUninitialized: false,
  })
);

// Middleware to make session data available to views
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));

// Logging
// if (process.env.NODE_ENV == "development") {
//   app.use(morgan("dev"));
// }

// Handlebars
const hbs = exphbs.create({ 
  defaultLayout: "main", 
  extname: ".hbs",
  helpers: {
    json: function(context) {
      return JSON.stringify(context);
    },
    multiply: function(num1, num2) {
      return num1 * num2;
    },
    eq: function(a, b) {
      return a === b;
    },
    split: function (str, delimiter, index) {
      let arr = str.split(delimiter);
      return arr[index];
    },
    unless_eq: function(a, b, opts) {
      if (a !== b) {
          return opts.fn(this);
      } else {
          return opts.inverse(this);
      }
    },
  }
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

// Cookie Parser
app.use(cookieParser());

// Static folder
// app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
// app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} on http://localhost:${PORT}`
  );
});
