const express = require("express");
const router = express.Router();
const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");

// @desc        Landing Page
// @route       GET /
router.get("/", (req, res) => {
  res.render("home", { session: req.session });
});

// @desc        Login
// @route       GET /login
router.get("/login", (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

// @desc        Process Login Form
// @route       POST /register
router.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  // get customer info from database using email
  let sql = `SELECT * FROM customers WHERE email='${email}';`;

  connection.query(sql, function (err, result) {
    if (err) console.log(err);

    // Returns user to the home screen if email does not exist
    if (result.size == 0) {
      console.log("no user found");
      return res.render("/login");
    }

    // Compare the user-entered password with the stored hashed password
    bcrypt.compare(password, result[0]["password"], function (err, result) {
      if (err) {
        // Handle the error
        console.log(err);
      } else if (result) {
        // Passwords match, allow user to log in
        console.log("logged in successfully");

        // TODO: create session
        let session = req.session;
        session.email = email;

        return res.redirect("/");
      } else {
        // Passwords do not match, deny access
        console.log("passwords do not match");
        return res.redirect("/login");
      }
    }); // end of bcrypt compare
  }); // end of sql query command
}); // end of login form post

// @desc        Logout
// @route       GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
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
  let email = req.body.email;
  let password1 = req.body.password1;
  let password2 = req.body.password2;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let phonenumber = req.body.phonenumber;

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

  let sql = generateRegisterCmd(
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
  let sql = `SELECT COUNT(*) AS EmailCount FROM customers WHERE email='${email}'`;

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
