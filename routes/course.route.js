const express = require("express");
const courseRouter = express.Router();
const controller = require('../controllers/course.controller')

// Route to get all courses while user click "All courses" button in Interface
courseRouter.get("/", controller.getAllCourses);

// Exporting this route to allRoutes.js
module.exports = courseRouter