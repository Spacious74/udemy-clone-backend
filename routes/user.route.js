const express = require('express');
const userRouter = express.Router();
const controller = require("../controllers/user.controller")

// Getting user information by its ID
userRouter.get('/profile/:id', controller.getUserById);

// Registering the user
userRouter.post("/register", controller.createUser);

// Delete user
userRouter.delete('/:id', controller.deleteUser);

// exporting this route to allRoutes.js
module.exports = userRouter;


