const express = require("express");
const courseRouter = express.Router();
const controller = require('../controllers/course.controller')

// Route to get all courses while user click "All courses" button in Interface
courseRouter.get("/", controller.getAllCourses);

// Get a specific course details by id
courseRouter.get("/:cId", controller.getCourseDetails);

// To create a new Course
courseRouter.post("/create", controller.createCourse)


// Exporting this route to allRoutes.js
module.exports = courseRouter