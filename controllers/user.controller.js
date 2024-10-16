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
        playlist: user.playlist,
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
  if (!userbody.username || !userbody.password || !userbody.email || !userbody.role) {
    res.status(400).send({
      message: "Please enter all required fields!",
    });
    return;
  }
  
  try {
    const user = await User.findOne({ email: userbody.email });
    if (user) {
      res.status(400).send({
        message: "User already registered with this email !",
      });
      return;
    }
    const userCreated = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    });

    // assigning a cart for the user.
    await Cart.create({
      userId: userCreated._id,
    });

    const token = jwt.sign(
      { uid: userCreated._id, email: userCreated.email }, process.env.SECRET_KEY, { expiresIn: "1h" }
    );

    res.status(201).send({
      data : userCreated,
      message: "User registered successfully!",
      success: true,
      token,
    });

  } catch (error) {
    res.status(500).send({
      message: "Bad request",
      success: false,
      error: error.message,
    });
  }
};

const getSessionLogonData = async(req, res)=>{
  try {

    const userId = req.user.uid;
    if(!userId){
      return res.status(404).send({    
        message: "Something went wrong while token authentication. Try again!",
        success: false,
      });
    }
    const user = await User.findById(userId).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).send({    
        message: "User not found",
        success: false,
      });
    }

    // User details return karo
    res.status(200).send({    
      data : user,
      success: true,
    });

  } catch (error) {
    console.error(error);
    res.status(401).send(
      {    
        message: "Invalid or Expired token provided.",
        success: false,
      }
    );
  }
}

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({
        message: "User not found! Please create your account.",
      });
    }

    let result = await bcrypt.compare(password, user.password);

    if (!result) {
      return res.status(401).send({
        message: "Invalid credentials! Please try again.",
        success : false,
      });
    }

    const token = jwt.sign(
      { uid: user._id, email: user.email },
      process.env.SECRET_KEY,
      {expiresIn: "1h"}
    );

    return res.status(200).send({
      data : user,
      message: "User Loggined successfully!",
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).send({
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
  getSessionLogonData
};
