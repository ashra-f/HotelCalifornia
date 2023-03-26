const express = require("express");
const router = express.Router();
const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");

// @desc        Landing Page
// @route       GET /
router.get("/", (req, res) => {
  res.render("home");
});

// @desc        Login
// @route       GET /login
router.get("/login", (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

// @desc        Register
// @route       GET /register
router.get("/register", (req, res) => {
  res.render("register", {
    layout: "login",
  });
});

// @desc        Search For Rooms
// @route       GET /search
router.get("/search", (req, res) => {
  // query database for rooms

  // render page
  res.render("rooms");
});

// @desc        Process Register Form
// @route       POST /register
router.post("/register", async (req, res) => {
  var email = req.body.email;
  var password1 = req.body.password1;
  var password2 = req.body.password2;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var phonenumber = req.body.phonenumber;

  // Redirects back to register page if email is already in use
  if (checkUsedEmails(email)) {
    return res.redirect("/register");
  }

  // Redirects back to register page if passwords don't match
  if (!signUpPasswords(password1, password2)) {
    return res.redirect("/register");
  }

  // Generate a salt
  const salt = await bcrypt.genSalt(10);

  // Hash the password using the salt
  const hashedPassword = await bcrypt.hash(password1, salt);

  var sql = generateRegisterCmd(
    email,
    hashedPassword,
    firstname,
    lastname,
    phonenumber
  );

  connection.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return res.redirect("/register");
    }

    console.log("1 record inserted");
    res.redirect("/"); // go to home page
  }); // end connection
}); // end router post

const generateRegisterCmd = (email, password, fname, lname, phone) =>
  `INSERT INTO customers (email, password, fname, lname, phone) VALUES ('${email}', '${password}', '${fname}', '${lname}', '${phone}')`;

const signUpPasswords = (password1, password2) => password1 === password2;

const checkUsedEmails = (email) => {
  var sql = `SELECT COUNT(*) AS EmailCount FROM customers WHERE email='${email}'`;

  connection.query(sql, function (err, result) {
    if (err) console.log(err);

    if (result[0]["EmailCount"] >= 1) {
      console.log("email already in use");
      return true;
    }
    return false;
  });
};

module.exports = router;
