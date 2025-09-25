const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;

// Models
const Cart = require("../models/Cart");
const User = require("../models/User");
const DraftedCourse = require('../models/DraftedCourse');

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
  const userData = req.body;
  console.log(userData);
  try {
    const user = await User.findOne({ _id: userData.userId });
    if (!user) {
      res.status(404).send({
        message: "User not found",
        success: false,
      }); return;
    }
    const updatedUser = await User.findByIdAndUpdate(userData.userId, userData, {
      new: true, runValidators: true
    });

    await DraftedCourse.updateMany({ "educator.edId": userData.userId }, { $set: { "educator.edname": updatedUser.username } });

    res.status(200).send({
      data: updatedUser,
      message: "User info. updated successfully!",
      success: true,
    });

  } catch (error) {
    res.status(500).send({
      message: "Some internal error occured!",
      error: error.message,
      success: false,
    });
  }
};

const uploadImageToCloudinary = async (req, res) => {
  try {
    const file = req.files.file;
    const userId = req.user.uid;

    const user = await User.findById({ _id: userId });
    if (user.profileImage != '') {
      const publicId = user.profileImage.split('/').pop().split('.')[0];
      const deleteResult = await deleteImageFromCloudinary(publicId);
      if (deleteResult.success) {
        user.profileImage = "";
        await user.save();
      } else {
        return res.status(500).json({ message: deleteResult.message });
      }
    }

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.', success: false });
    }
    const base64Data = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'SkillUp_UserProfile',
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: result.secure_url },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      data: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Image upload failed.', error: error.message });
  }
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy('SkillUp_UserProfile/' + publicId);
    console.log(result);
    if (result.result === 'ok') {
      return { success: true, message: 'Image deleted successfully.' };
    } else {
      return { success: false, message: 'Image deletion failed.', result };
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, message: 'An error occurred during image deletion.', error: error.message };
  }
};

const deleteUploadedImage = async (req, res) => {

  const userId = req.user.uid;
  try {

    const user = await User.findById(userId);
    if (!user || !user.profileImage) {
      return res.status(404).json({ message: 'User or Profile Image not found.' });
    }

    const publicId = user.profileImage.split('/').pop().split('.')[0]; // Extract public ID from URL

    const deleteResult = await deleteImageFromCloudinary(publicId);

    if (deleteResult.success) {
      // Remove the image URL from the user record
      user.profileImage = ""; // Optionally set the image field to null or an empty string
      await user.save();
      return res.status(200).json({ success: true, message: 'Profile picture deleted successfully.', data: user });

    } else {
      return res.status(500).json({ success: false, message: deleteResult.message });
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
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

    // Assigning a cart for the user.
    await Cart.create({
      userId: userCreated._id,
    });

    const token = jwt.sign(
      { uid: userCreated._id, email: userCreated.email }, process.env.SECRET_KEY, { expiresIn: "1d" }
    );

    res.status(201).send({
      data: userCreated,
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

const getSessionLogonData = async (req, res) => {
  try {

    const userId = req.user.uid;
    if (!userId) {
      return res.status(404).send({
        message: "Something went wrong while token authentication. Try again!",
        success: false,
      });
    }
    const user = await User.findById(userId).select('-password').populate("coursesEnrolled"); // Exclude password
    const cart = await Cart.findOne({ userId: userId });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    // User details return karo
    res.status(200).send({
      data: user,
      cart: cart,
      success: true,
    });

  } catch (error) {
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
        success: false,
      });
    }

    const token = jwt.sign(
      { uid: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).send({
      data: user,
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

const getUserCourseEnrolled = async (req, res) => {

  try {
    const userId = req.user.uid;
    if (!userId) {
      return res.status(404).send({
        message: "Something went wrong while token authentication. Try again!",
        success: false,
      });
    }

    const user = await User.findById({ _id: userId }).populate('coursesEnrolled');
    if (!user) {
      return res.status(404).send({
        message: "User not found. Please create an account!",
        success: false,
      });
    }

    res.status(200).send({
      data: user.coursesEnrolled,
      success: true
    });

  } catch (error) {
    res.status(401).send(
      {
        message: "Invalid or Expired token provided.",
        success: false,
      }
    );
  }

}

module.exports = {
  getUserById,
  createUser,
  loginUser,
  logoutUser,
  updateUserInfo,
  getSessionLogonData,
  uploadImageToCloudinary,
  deleteUploadedImage,
  getUserCourseEnrolled
};
