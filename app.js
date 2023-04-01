const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const {
  connection,
  createTableCustomer,
  dropTableCustomers,
} = require("./config/db");
const bodyParser = require("body-parser");

// Connect to database
// connection.connect((err) => {
//   if (err) throw err;
//   console.log(`Connected to database on port 3306`);
// });

// createTableCustomer();
// dropTableCustomers();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// Handlebars
app.engine(".hbs", exphbs.engine({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

const oneDay = 1000 * 60 * 60 * 24;

// Sessions
app.use(
  session({
    secret: "flying dolphin agent 47",
    resave: false,
    cookie: { maxAge: oneDay },
    saveUninitialized: true,
  })
);

// Cookie Parser
app.use(cookieParser());

// Static folder
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
