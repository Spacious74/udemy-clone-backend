const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailService');
const { generateEmailVerificationTemplate } = require('../templates/emailVerificationTemplate');
const { generateForgotPasswordTemplate } = require('../templates/forgotPasswordTemplate');

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
  const userId = req.user.uid;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send({
        message: "User not found",
        success: false,
      }); return;
    }

    // Prevent IDOR: use token's userId, ignore body's userId
    delete userData.userId;

    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true, runValidators: true
    });

    await DraftedCourse.updateMany({ "educator.edId": userId }, { $set: { "educator.edname": updatedUser.username } });

    let token = undefined;
    if (userData.role && userData.role !== user.role) {
      token = jwt.sign(
        { uid: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
      );
    }

    res.status(200).send({
      data: updatedUser,
      message: "User info. updated successfully!",
      success: true,
      ...(token && { token })
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
      if (deleteResult.success || (deleteResult.result && deleteResult.result.result === 'not found')) {
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

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const userCreated = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry
    });

    // Assigning a cart for the user.
    await Cart.create({
      userId: userCreated._id,
    });

    const htmlTemplate = generateEmailVerificationTemplate(verificationToken);
    await sendEmail(userCreated.email, 'Verify your email address - SkillUp', htmlTemplate);

    res.status(201).send({
      data: userCreated,
      message: "Registration successful! Please check your email to verify your account.",
      success: true,
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

    if (!user.isVerified) {
      return res.status(403).send({
        message: "Please verify your email before logging in.",
        success: false,
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
      { uid: user._id, email: user.email, role : user.role },
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

const googleSignup = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send({ message: "Token is required!", success: false });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send({
        message: "User already registered with this email! Please login.",
        success: false
      });
    }

    const generatedPassword = Math.random().toString(36).slice(-8); // Random password for google users
    const userCreated = await User.create({
      username: name,
      email: email,
      password: bcrypt.hashSync(generatedPassword, 10),
      profileImage: picture || '',
      isActive: true,
      isVerified: true
    });

    // Assigning a cart for the user.
    await Cart.create({
      userId: userCreated._id,
    });

    const jwtToken = jwt.sign(
      { uid: userCreated._id, email: userCreated.email, role: userCreated.role }, process.env.SECRET_KEY, { expiresIn: "1d" }
    );

    res.status(201).send({
      data: userCreated,
      message: "User registered successfully via Google!",
      success: true,
      token: jwtToken,
    });

  } catch (error) {
    res.status(500).send({
      message: "Google Signup failed!",
      success: false,
      error: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send({ message: "Token is required!", success: false });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const { email } = payload;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        message: "User not found! Please sign up first.",
        success: false
      });
    }

    const jwtToken = jwt.sign(
      { uid: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).send({
      data: user,
      message: "User Logged in successfully via Google!",
      success: true,
      token: jwtToken,
    });

  } catch (error) {
    res.status(500).send({
      message: "Google Login failed!",
      success: false,
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send({ message: "Invalid or missing token.", success: false });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send({
        message: "Token is invalid or has expired.",
        success: false
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.status(200).send({
      message: "Email verified successfully! You can now log in.",
      success: true
    });

  } catch (error) {
    res.status(500).send({
      message: "Internal server error during verification.",
      success: false,
      error: error.message
    });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required.", success: false });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found.", success: false });
    }

    if (user.isVerified) {
      return res.status(400).send({ message: "User is already verified.", success: false });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = hashedToken;
    user.verificationTokenExpiry = tokenExpiry;
    await user.save();

    const htmlTemplate = generateEmailVerificationTemplate(verificationToken);
    await sendEmail(user.email, 'Verify your email address - SkillUp', htmlTemplate);

    res.status(200).send({
      message: "Verification email sent successfully.",
      success: true
    });

  } catch (error) {
    res.status(500).send({
      message: "Internal server error while resending verification email.",
      success: false,
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ message: "Email is required.", success: false });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration attacks
      return res.status(200).send({
        message: "If your email is registered, you will receive a reset link.",
        success: true
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const htmlTemplate = generateForgotPasswordTemplate(resetUrl, user.username);
    await sendEmail(user.email, 'Reset your SkillUp password', htmlTemplate);

    res.status(200).send({
      message: "If your email is registered, you will receive a reset link.",
      success: true
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error while processing password reset request.",
      success: false,
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).send({ message: "Token and new password are required.", success: false });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send({
        message: "Reset token is invalid or has expired.",
        success: false
      });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send({
      message: "Password has been successfully reset. You can now log in.",
      success: true
    });

  } catch (error) {
    res.status(500).send({
      message: "Internal server error while resetting password.",
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getUserById,
  createUser,
  loginUser,
  logoutUser,
  updateUserInfo,
  getSessionLogonData,
  uploadImageToCloudinary,
  deleteUploadedImage,
  getUserCourseEnrolled,
  googleSignup,
  googleLogin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};
