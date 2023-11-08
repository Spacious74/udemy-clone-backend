const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const CustomErroHandler = require("../utils/customErrorHandler");

const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getUserById = async (req, res) => {};

const createUser = async (req, res) => {
  const userbody = req.body;

  if (!userbody.username || !userbody.password || !userbody.email) {
    return next(new CustomErroHandler("Please provide all fields", 404));
  }

  const user = await User.findOne({ email: userbody.email });
  if (user) {
    // 409 for conflicting the request again even user is already exists in db.
    return next(new CustomErroHandler("User already exists", 409));
  }

  const userCreated = await User.create({
    username: userbody.username,
    email: userbody.email,
    password: bcrypt.hashSync(userbody.password, 10),
    profilePicture: {
      public_id: "sampleId",
      url: "sampleUrl",
    },
  });
  res.status(201).send({
    message: "User registered successfully.",
    userCreated,
  });
};

const deleteUser = async (req, res) => {};

module.exports = {
  getUserById,
  createUser,
  deleteUser,
};
