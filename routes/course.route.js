const express = require("express");
const courseRouter = express.Router();
const controller = require('../controllers/course.controller')

courseRouter.get("/", controller.getAllCourses);
courseRouter.get("/getCourseById", controller.getCourseDetails);
courseRouter.get('/getDraftedCourse', controller.getCourseByEdIdAndCourseId);

courseRouter.post("/create", controller.createCourse)
courseRouter.delete("/delete/:id", controller.deleteCourse);
courseRouter.put("/update/:id", controller.updateCourse);

courseRouter.get('/category/:category', controller.getAllCoursesByCategory);


// Exporting this route to allRoutes.js
module.exports = courseRouter