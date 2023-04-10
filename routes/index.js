const express = require("express");
const router = express.Router();
const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");

// * ALL ROUTES * //
// @desc        Landing Page
// @route       GET /
router.get("/", (req, res) => {
  const loginSuccess = req.query.loginSuccess === 'true';
  const logoutSuccess = req.query.logoutSuccess === 'true';
  const registerSuccess = req.query.registerSuccess === 'true';
  const errMsg = req.query.errMsg;

  res.render("home", { loginSuccess, logoutSuccess, registerSuccess, errMsg });
});

// @desc        Login
// @route       GET /login
router.get("/login", (req, res) => {
  const loginFailure = req.query.loginFailure === 'true';
  const notLoggedIn = req.query.errMsg === 'notLoggedIn';

  res.render("login", {
    layout: "login",
    loginFailure,
    notLoggedIn
  });
});

// @desc        Process Login Form
// @route       POST /register
router.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let firstname;
  let lastname;
  let phonenumber;

  // get customer info from database using email
  let sql = `SELECT * FROM customers WHERE email='${email}';`;

  connection.query(sql, function (err, result) {
    if (err) console.log(err);

    // Returns user to the home screen if email does not exist
    if (result.length == 0) {
      console.log("no user found");
      return res.redirect(
        "/login?errMsg=" + encodeURIComponent("Error Logging In")
      );
    }

    firstname = result[0]["fname"];
    lastname = result[0]["lname"];
    phonenumber = result[0]["phone"];

    // Compare the user-entered password with the stored hashed password
    bcrypt.compare(password, result[0]["password"], function (err, result) {
      if (err) {
        // Handle the error
        console.log(err);
      } else if (result) {
        // Passwords match, allow user to log in
        console.log("logged in successfully");

        // TODO: create session
        req.session.email = email;
        req.session.firstname = firstname;
        req.session.lastname = lastname;
        req.session.phonenumber = phonenumber;

        return res.redirect("/?loginSuccess=true");
      } else {
        // Passwords do not match, deny access
        console.log("passwords do not match");
        return res.redirect(
          "/login?loginFailure=true"
        );
      }
    }); // end of bcrypt compare
  }); // end of sql query command
}); // end of login form post

// @desc        Logout
// @route       GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/?logoutSuccess=true");
});

// @desc        reservations
// @route       GET /reservations
router.get("/reservations", (req, res) => {
  // if logged out, return to home page
  if (!req.session.email) {
    return res.redirect('/login?errMsg=notLoggedIn');
  }

  // Get users reservations from database
  const currentEmail = req.session.email;

  const sql = `SELECT rooms.*, reservations.*, img_urls.img_urls
                      FROM reservations
                      JOIN rooms ON reservations.roomId = rooms.roomId
                      JOIN (
                        SELECT roomId, GROUP_CONCAT(img_url SEPARATOR ', ') AS img_urls
                        FROM room_imgs
                        GROUP BY roomId
                      ) AS img_urls ON img_urls.roomId = rooms.roomId
                      WHERE email = '${currentEmail}'
                      ORDER BY reservations.check_in_date`;

  connection.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }

    result.forEach((room) => {
      room.img_urls = room.img_urls.split(", ");
      const startDate = new Date(room.check_in_date);
      const endDate = new Date(room.check_out_date);

      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const sDate = startDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }); // returns "Wed Apr 05 2023"
      const eDate = endDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }); // returns "Wed Apr 05 2023"

      room.check_in_date = sDate;
      room.check_out_date = eDate;
      room.days = daysDiff;
    });

    // Check if check-out date has passed and remove reservation from database
    result.forEach((room) => {
      const endDate = new Date(room.check_out_date);
      const today = new Date();

      if (endDate < today) {
        updateReservationStatus(room.roomId, "completed");
        updateRoomStatus(room.roomId, "available");
      }
    });

    const bookSuccess = req.query.bookSuccess === 'true';
    const cancelSuccess = req.query.cancelSuccess === 'true';
    const cancelFailure = req.query.cancelFailure === 'true';

    res.render("reservations", { 
      reservations: result, 
      bookSuccess, 
      cancelSuccess, 
      cancelFailure, 
      currentPage: "manage-reservations" 
    });
  }); // end connection
}); // end get reservations

// @desc        Register
// @route       GET /register
router.get("/register", (req, res) => {
  const registerSuccess = req.query.registerSuccess === 'false';

  res.render("register", {
    layout: "login",
    registerSuccess,
  });
});

router.get("/book", (req, res) => {
  res.render("home", {});
});

// veri stuupiyd codey dont do anymore bad, but enjoyable, I owe ash 1 million --shawske ryan
router.post("/book", (req, res) => {
  if (!req.session.email) {
    return res.redirect("/register");
  }
  res.render("book", { room: JSON.parse(req.body.roomInfo) });
});

// @desc        Search For Rooms
// @route       GET /search
router.get("/search", (req, res) => {
  // query database for rooms
  let num_guests = req.query.num_guests;
  let check_in = req.query.check_in_date;
  let check_out = req.query.check_out_date;

  if (check_out <= check_in) {
    return res.redirect("/?errMsg=" + encodeURIComponent("Invalid Dates"));
  }

  //WHERE check_out<today
  //JOIN reservations
  let sql = `SELECT rooms.*, GROUP_CONCAT(room_imgs.img_url SEPARATOR ', ') AS img_urls, amenities.*
                  FROM rooms
                  JOIN room_imgs ON rooms.roomId = room_imgs.roomId
                  JOIN amenities ON amenities.roomId = rooms.roomId
                  WHERE max_guests >= ${num_guests} AND availability = "available"
                  GROUP BY rooms.roomId;`;

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

      const startDate = new Date(check_in);
      const endDate = new Date(check_out);

      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      room.days = daysDiff;
      room.check_in = check_in;
      room.check_out = check_out;
      room.total_guests = num_guests;
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
      return res.redirect("/register?registerFailure=true");
    }

    // TODO: create session
    req.session.email = email;
    req.session.firstname = firstname;
    req.session.lastname = lastname;
    req.session.phonenumber = phonenumber;

    res.redirect("/?registerSuccess=true"); // go to home page
  }); // end connection
}); // end router post

// @desc        Process Pay Form
// @route       POST /process-pay
router.post("/process-pay", (req, res) => {
  const roomInfo = JSON.parse(req.body.roomInfo);
  const roomId = roomInfo.roomId;
  const check_in_date = roomInfo.check_in;
  const check_out_date = roomInfo.check_out;
  const totalPayment = roomInfo.price_per_night * roomInfo.days;
  const total_guests = roomInfo.total_guests;
  const cc_num = req.body.card;
  const email = req.body.email;
  const stat = "booked";

  // Add entry into the reservations table
  // Needs: roomID, email, totalPayment, checkInDate, checkOutDate, totalGuests,  cc_num, and stat
  const sql = `INSERT INTO reservations (roomId, email, totalPayment, cc_num, check_in_date, check_out_date, total_guests, stat) 
                        VALUES('${roomId}', '${email}', '${totalPayment}', '${cc_num}', '${check_in_date}', 
                        '${check_out_date}', '${total_guests}', '${stat}');`;

  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    console.log("1 record inserted into reservations table.");

    updateRoomStatus(roomId, "not available");

    res.redirect("/reservations?bookSuccess=true");
  });
});

// @desc        Process Cancel Res Form
// @route       POST /cancel-reservations
router.post("/cancel-reservation", (req, res) => {
  const roomId = req.body.roomId;
  const check_in = req.body.check_in;

  // Check if check_in date is within 1 day of today
  const today = new Date();
  const checkInDate = new Date(check_in);
  const timeDiff = checkInDate.getTime() - today.getTime();

  if (timeDiff / (1000 * 3600 * 24) <= 1) {
    return res.redirect("/reservations?cancelFailure=true");
  }

  // Update the room's availability to booked
  updateReservationStatus(roomId, "cancelled");
  updateRoomStatus(roomId, "available");
  res.redirect("/reservations?cancelSuccess=true");
});

// * Helper Funcs * //
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

/*should return an array of all rooms with available amenities in an array
doesnt check if something is an array or not
[i] [0,1,2,3,4,5,6,7] size = 8
smoke,tv,wifi,minfridge,gym,pets,breakfast
test[0,1,0,1,0,1,0,1]
test[1,1,0,0,0,0,0,0]
amenetiesArray should contain only 0's or 1's to check for ameneties info, check helper for order*/
const checkAvailableAmenities = (amenitiesArray) => {
  let roomQuery = "";
  defaultArray = [0,0,0,0,0,0,0,0];
  if(amenitiesArray!=defaultArray){
  for (let i = 0; i < amenitiesArray.length; i++) {
    if (amenitiesArray[i] === 1) {
      roomQuery += amenetiesHelper(i) + "1 AND ";
    }
  }//end for
}//end if
else
{
  let roomQuery ="amenities.free_wifi=1";
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
    
    return false;
  });
}; // end of checkAvailableAmenities

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

//provides all reservations that are booked
const reservationsList = (email) => {
  let sql = `SELECT customers.email,customers.fname,customers.lname,customers.phone,reservations.roomid,reservations.status from customers LEFT JOIN reservations on customers.email=reservations.email  where customers.email ='${email}'`;
  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    return false;
  });
};

const updateReservationStatus = (roomId, stat) => {
  let sql = `UPDATE reservations SET stat='${stat}' WHERE roomId=${roomId} AND stat='booked';`;

  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    
  });
};

const updateRoomStatus = (roomId, stat) => {
  let sql = `UPDATE rooms SET availability='${stat}' WHERE roomId=${roomId};`;

  connection.query(sql, function (err, result) {
    if (err) console.log(err);
   
  });
};

// UPDATE rooms SET availability='available' WHERE roomId=${roomId};
module.exports = router;
