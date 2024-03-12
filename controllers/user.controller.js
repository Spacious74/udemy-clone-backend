const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models
const Cart = require("../models/Cart");
const User = require("../models/User");

const getUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById({ _id: userId });
    if (!user) {
      res.status(404).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        message: "Welcome to your profile.",
        username: user.username,
        email: user.email,
        playlist : user.playlist
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred!",
      error: error.message,
    });
  }
};

const updateUserInfo = async (req, res) => {
  const userId = req.params.userId;
  const { username, email } = req.body;
  try {
    const user = await User.findOne({ _id: userId });
    user.username = username ? username : user.username;
    user.email = email ? email : user.email;
    await user.save();
    res.status(200).send({
      message: "Info updated successfully!",
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occured!",
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  const userbody = req.body;
  if (!userbody.username || !userbody.password || !userbody.email) {
    res.status(403).send({
      message: "Missing fields",
    });
    return;
  }

  try {
    const user = await User.findOne({ email: userbody.email });
    if (user) {
      res.status(409).send({
        message: "User already exists. Please login.",
      });
      return;
    }
    const userCreated = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      profilePicture: {
        public_id: "sampleId",
        url: "sampleUrl",
      },
    });

    // assigning a cart for the user.
    await Cart.create({
      userId: userCreated._id,
    });

    const token = jwt.sign(
      { uid: userCreated._id, email: userCreated.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("mytoken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).send({
      message: "User registered successfully!",
      token,
      username: userCreated.username,
      email: userCreated.email,
    });
  } catch (error) {
    res.status(404).send({
      message: "Bad request",
      error: error.message,
    });
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).send({
        message: "User not found! Please create your account.",
      });
      return;
    }
    const matchPassword = bcrypt.compare(password, user.password);

    if (!matchPassword) {
      res.status(401).send({
        message: "Invalid credentials! Please try again.",
      });
      return;
    }

    const token = jwt.sign(
      { uid: user._id, email: user.email },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("mytoken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).send({
      message: "User logged in successfully.",
      username: user.username,
      email: user.email,
      token: token,
    });
  } catch (error) {
    res.status(404).send({
      message: "Bad request. Please try again!",
      error: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("mytoken");
    res.status(200).send({
      message: "User logged out. Login again!",
    });
  } catch (error) {
    res.status(404).send({
      message: "Bad request. Please try again!",
      error: error.message,
    });
  }
};

module.exports = {
  getUserById,
  createUser,
  loginUser,
  logoutUser,
  updateUserInfo,
};
