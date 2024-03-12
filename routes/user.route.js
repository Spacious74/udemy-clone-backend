const express = require('express');
const userRouter = express.Router();
const controller = require("../controllers/user.controller");
const { verifyToken } = require('../middlewares/authMiddleware');


// Getting user information by its ID
userRouter.get('/profile/:userId', verifyToken, controller.getUserById);
userRouter.put('/update/:userId', verifyToken, controller.updateUserInfo);

// Registering the user
userRouter.post("/register", controller.createUser);

// Login user 
userRouter.post('/login', controller.loginUser);

// Logout user
userRouter.post('/logout', controller.logoutUser);

// exporting this route to allRoutes.js
module.exports = userRouter;


