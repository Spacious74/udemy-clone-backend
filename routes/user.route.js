const express = require('express');
const userRouter = express.Router();
const controller = require("../controllers/user.controller");
const { verifyToken, verifyTokenEncoded } = require('../middlewares/authMiddleware');


// Getting user information by its ID
userRouter.get('/profile/:userId', verifyToken, controller.getUserById);

// Getting user's Courses Enrolled
userRouter.get('/get-user-courses-enrolled', verifyToken, controller.getUserCourseEnrolled);

userRouter.post('/update', verifyToken, controller.updateUserInfo);
userRouter.post('/upload', verifyToken, controller.uploadImageToCloudinary);
userRouter.delete('/deleteImage', verifyToken, controller.deleteUploadedImage);

// Registering the user
userRouter.post("/register", controller.createUser);

// Login user 
userRouter.post('/login', controller.loginUser);

// Google Auth
userRouter.post('/google/signup', controller.googleSignup);
userRouter.post('/google/login', controller.googleLogin);

//Get User Details by token verification
userRouter.get('/getUserLogonData', verifyToken, controller.getSessionLogonData);

// Logout user
userRouter.post('/logout', controller.logoutUser);

// Email Verification
userRouter.get('/verify-email', controller.verifyEmail);
userRouter.post('/resend-verification', controller.resendVerification);

// Forgot and Reset Password
userRouter.post('/forgot-password', controller.forgotPassword);
userRouter.post('/reset-password/:token', controller.resetPassword);

// exporting this route to allRoutes.js
module.exports = userRouter;