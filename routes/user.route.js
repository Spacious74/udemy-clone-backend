const express = require('express');
const userRouter = express.Router();
const controller = require("../controllers/user.controller");
const upload = require('../config/multerConfig');
const { verifyToken, verifyTokenEncoded } = require('../middlewares/authMiddleware');


// Getting user information by its ID
userRouter.get('/profile/:userId', verifyToken, controller.getUserById);

// Getting user's Courses Enrolled
userRouter.get('/get-user-courses-enrolled', verifyToken, controller.getUserCourseEnrolled);

userRouter.post('/update', controller.updateUserInfo);
userRouter.post('/upload', verifyToken, controller.uploadImageToCloudinary);
userRouter.delete('/deleteImage', verifyToken, controller.deleteUploadedImage);

// Registering the user
userRouter.post("/register", controller.createUser);

// Login user 
userRouter.post('/login', controller.loginUser);

//Get User Details by token verification
userRouter.get('/getUserLogonData', verifyToken, controller.getSessionLogonData);

// Logout user
userRouter.post('/logout', controller.logoutUser);

// exporting this route to allRoutes.js
module.exports = userRouter;


