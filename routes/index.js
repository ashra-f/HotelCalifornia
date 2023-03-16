const express = require("express");
const router = express.Router();

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

module.exports = router;
