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

// @desc        Logout
// @route       GET /logout
router.get("/registration", (req, res) => {
  res.render("registration", {});
});

// @desc        Register
// @route       GET /register
router.get("/register", (req, res) => {
  res.render("register", {
    layout: "login",
  });
});

router.get("/book", (req, res) => {
  res.render("book", {});
});

// @desc        Search For Rooms
// @route       GET /search
router.get("/search", (req, res) => {
  // query database for rooms
  let num_guests = req.query.num_guests;
  let check_in = req.query.check_in_date;
  let check_out = req.query.check_out_date;

  let sql = `SELECT rooms.*, GROUP_CONCAT(room_imgs.img_url SEPARATOR ', ') AS img_urls
                  FROM rooms
                  JOIN room_imgs ON rooms.roomId = room_imgs.roomId
                  WHERE max_guests >= ${num_guests} AND availability = "available"
                  GROUP BY rooms.roomId;`;

  // let sql1 = `SELECT *
  // FROM room_imgs AND rooms
  // WHERE rooms.roomId = room_imgs.roomId`;

  let roomsArr = [];

  connection.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }

    roomsArr = result;

    // Iterate over the rooms array and modify the img_urls property
    roomsArr.forEach((room) => {
      room.img_urls = room.img_urls.split(", ");
    });

    console.log(roomsArr);
    // Render Page
    res.render("rooms", { rooms: roomsArr });
  }); // end connection
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

/*should return an array of all rooms with available ameneties in an array
doesnt check if something is an array or not
[i] [0,1,2,3,4,5,6,7] size = 8
smoke,tv,wifi,minfridge,gym,pets,breakfast
test[0,1,0,1,0,1,0,1]
test[1,1,0,0,0,0,0,0]
amenetiesArray should contain only 0's or 1's to check for ameneties info, check helper for order*/
const checkAvailableAmenities = (amenitiesArray) => {
  let roomQuery = "";

  for (let i = 0; i < amenitiesArray.length; i++) {
    if (amenitiesArray[i] === 1) {
      roomQuery += amenetiesHelper(i) + "1 AND ";
    }
  }

  // Remove the trailing " AND " from the last amenity in the query
  roomQuery = roomQuery.slice(0, -5);

  //toast
  console.log(roomQuery);

  //note where is says availability = 1, expected inputs in room table: A room booked(true) = 1, A room Available(false) = 0
  let sql = `SELECT amenities.smoke,amenities.tv,amenities.gym,amenities.free_wifi,amenities.minifridge,amenities.pets,amenities.breakfast,rooms.roomId,rooms.availability
                  FROM amenities
                  LEFT JOIN rooms ON rooms.roomId=amenities.roomId
                  WHERE ${roomQuery} AND availability = 'available';`;

  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    console.log(result);
    return false;
  });
}; // end of checkAvailbleAmenities

const amenetiesHelper = (amenetiesNum) => {
  switch (amenetiesNum) {
    case 0:
      return "amenities.smoke=";
    case 1:
      return "amenities.tv=";
    case 2:
      return "amenities.gym=";
    case 3:
      return "amenities.free_wifi=";
    case 4:
      return "amenities.minifridge=";
    case 5:
      return "amenities.gym=";
    case 6:
      return "amenities.pets=";
    case 7:
      return "amenities.breakfast=";
  }
};

module.exports = router;
