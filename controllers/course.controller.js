// Importing Course db model
const Course = require("../models/Course");
const CustomErrorHandler = require('../utils/customErrorHandler')
// A middleware method for catching async errors while fetching/sending data from/to database.

const catchAsyncError = require("../middlewares/catchAsyncError");

// Here catchAsyncError method takes a controller function as argument and if there is not any async error then controller function run successfully otherwise returns error.

const getAllCourses = catchAsyncError(async (req, res, next) => {
  // By default if user try to fetch all or a particular course then we have to 
  // restric the access of lectures in that course
  const courses = await Course.find().select("-lectures");
  res.status(200).send({
    message: "courses fetched successfully",
    courses,
  });

});

const createCourse = catchAsyncError(async (req,res,next) =>{

  const {title, description, category, educator} = req.body;

  if(!title || !description || !category || !educator){
    return next(new CustomErrorHandler("Please provide missing fields", 400));
  }

  await Course.create({
    title,
    description,
    category, 
    educator,
    coursePoster : {
      public_id :"temp",
      url : "temp"
    }
  })

  res.status(200).send({
    success : true,
    message: "courses added successfully",
  });
})

const addLecture = catchAsyncError(async(req,res, next) => {
  const courseId = req.params.cId;
  const course = await Course.findById({id : courseId});
  const lec = req.body;
  const obj = {
    lecuterTitle : lec.title,
    lectureLength : lec.length,
    video : {
      public_id : "temp",
      url : "tempurl",
    }
  }
  await Course.create({
    lectures : [obj]
  })
});


// Exporting all controller methods to their specified routes, here exporting to course.route.js
module.exports = {
  getAllCourses,
  createCourse,
  addLecture
};
