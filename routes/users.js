// Imports ------------------------------------------------------------
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const userModel = require("../models/users-model");
const jsonwebtoken = require("jsonwebtoken");
const jwt = require("express-jwt");
const secretKey = "809fad9sffa0dsfj0das";
// --------------------------------------------------------------------

// Kelvin GET ENPOINT WITH ID --------------------------------------------
// -----------------------------------------------------------------------

// LOGIN ENDPOINT --------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const isEmailStored = await userModel.exists({ email: req.body.email });
    // -------------------------------------------------------------------
    if (isEmailStored) {
      const userData = await userModel.findOne({ email: req.body.email });
      //   ---------------------------------------------------------------
      if (await bcrypt.compare(req.body.password, userData.password)) {
        // the delete the password property from the data bieng sent
        const token = jsonwebtoken.sign({ userId: userData._id }, secretKey);
        const dataToSend = await userModel
          .findOne({ email: req.body.email }, { password: 0 })
          .then((data) => data.toObject());
        res.status(200).json({ ...dataToSend, token: token });
      } else {
        res.status(404).json({ message: "wrong password" });
      }
      //   ---------------------------------------------------------------
    } else {
      res.status(404).json({ message: "email not found" });
    }
    // -------------------------------------------------------------------
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//   -----------------------------------------------------------------------

// SIGN UP ENDPOINT --------------------------------------------------------
router.post("/sign-up", async (req, res) => {
  const userExist = await userModel.exists({ email: req.body.email });
  if (userExist) {
    res.json({ message: "try a different email" });
  } else {
    try {
      const hashpassword = await bcrypt.hash(req.body.password, 10);
      const userData = new userModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashpassword,
      });
      // 201 = successfully created something
      const newUser = await userData.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});
// --------------------------------------------------------------------

// UPDATE -------------------------------------------------------------
router.patch("/", getAuthUser, async (req, res) => {
  try {
    if (req.body.name != null) {
      res.user.name = req.body.name;
    }
    if (req.body.password != null) {
      res.user.password = req.body.password;
    }
    if (req.body.about != null) {
      res.user.about = req.body.about;
    }
    const newUserDetail = await res.user.save();
    res.json(newUserDetail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

// DELETE -------------------------------------------------------------
router.delete("/", authorise(), getAuthUser, async (req, res) => {
  try {
    await res.user.remove();
    res.status(200).json({ message: "your account was deleted successfully" });
  } catch (error) {
    // 500 = error in server
    res.status(500).json({ message: error.message });
  }
});
// --------------------------------------------------------------------

module.exports = router;

// ----------------------------------------------------------------
async function getUser(req, res, next) {
  let user;
  try {
    user = await userModel.findById(req.params.id, { password: 0, email: 0 });
    if (user == null) {
      // 404 = could not find something
      return res.status(404).json({ message: "Cannot Find User" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

async function getAuthUser(req, res, next) {
  let user;
  try {
    user = await userModel.findById(req.auth.userId, { password: 0, email: 0 });
    if (user == null) {
      // 404 = could not find something
      return res.status(404).json({ message: "Cannot Find User" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

function authorise() {
  return jwt.expressjwt({ secret: secretKey, algorithms: ["HS256"] });
}
