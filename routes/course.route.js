const express = require("express");
const courseRouter = express.Router();
const controller = require('../controllers/course.controller')

// Route to get all courses while user click "All courses" button in Interface
courseRouter.get("/", controller.getAllCourses);

// Get a specific course details by id
courseRouter.get("/:cId", controller.getCourseDetails);

// To create a new Course
courseRouter.post("/create", controller.createCourse)

// Adding a new lecture to the course
courseRouter.post("/addlecture", controller.addLecture);

// Deleteing a lecture
courseRouter.delete("/deleteLecture", controller.deleteLecture);


// Exporting this route to allRoutes.js
module.exports = courseRouter