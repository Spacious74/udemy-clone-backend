// Importing Course db model
const Course = require("../models/Course");

// A middleware method for catching async errors while fetching/sending data from/to database.
const catchAsyncError = require("../middlewares/catchAsyncError");

// Here catchAsyncError method takes a controller function as argument and if there is not any async error then controller function run successfully otherwise returns error.
const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find();
  res.status(200).send({
    message: "courses fetched successfully",
    courses,
  });
});

// Exporting all controller methods to their specified routes, here exporting to course.route.js
module.exports = {
  getAllCourses,
};
