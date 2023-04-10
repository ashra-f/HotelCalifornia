const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const Toastify = require("toastify-js");
const MySQLStore = require('connect-mysql')(session);
const { connection, parsedUrl } = require("./config/db");

// Connect to database
// connection.connect((err) => {
//   if (err) throw err;
//   console.log(`Connected to database on port 3306`);
// });

const app = express();

const sessionStore = new MySQLStore({
  config: {
    host: parsedUrl.hostname,
    user: parsedUrl.username,
    password: parsedUrl.password,
    database: parsedUrl.pathname.substring(1),
    port: parsedUrl.port || 3306,
  },
});

// Sessions
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "flying dolphin agent 47",
    store: sessionStore,
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
