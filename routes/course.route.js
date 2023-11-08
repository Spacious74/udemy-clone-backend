const express = require("express");
const courseRouter = express.Router();
const controller = require('../controllers/course.controller')

// Route to get all courses while user click "All courses" button in Interface
courseRouter.get("/", controller.getAllCourses);

// To create a new Course
courseRouter.post("/create", controller.createCourse)

courseRouter.post("/addlecture/:cId", controller.addLecture);


// Exporting this route to allRoutes.js
module.exports = courseRouter