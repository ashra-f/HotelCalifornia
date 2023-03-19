const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const connection = require("./config/db");

dotenv.config({ path: "./config/config.env" });

connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected to database on port ${process.env.DB_PORT}`);
});

const app = express();

// Logging
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// Handlebars
app.engine(".hbs", exphbs.engine({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

// Sessions
app.use(
  session({
    secret: "flying dolphin agent 47",
    resave: false,
    saveUninitialized: false,
  })
);

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
