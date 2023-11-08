// Importing Course db model
const Course = require("../models/Course");
const CustomErrorHandler = require('../utils/customErrorHandler')
// A middleware method for catching async errors while fetching/sending data from/to database.
const catchAsyncError = require("../middlewares/catchAsyncError");
// Here catchAsyncError method takes a controller function as argument and if there is not any async error then controller function run successfully otherwise returns error.

const getCourseDetails = catchAsyncError(async(req,res,next)=>{
  const cId = req.params.cId;
  const course = await Course.findOne({_id : cId});
  if(!course){
    res.status(404).send({
      message : "Course not found"
    })
  }
  res.status(200).send({
    message : "Course details fetched successfully",
    course
  })
})


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
  const courseId = req.query.cid;
  const educatorId = req.query.eid;
  const course = await Course.findOne({_id : courseId});

  if (!course) {
    // If the course is not found, return a 404 Not Found status code.
    res.status(404).send({
      message: "Course not found",
    });
    return;
  }

  // Only who created that course can add lectures to it.
  if(educatorId != course.educator.edId){
    // 401 status code for unauthorised access to the endpoint.
    res.status(401).send({
      message : "Only owner of this course can add lectures to it."
    })
    return;
  }

  const lec = req.body;
  const obj = {
    lecuterTitle : lec.title,
    lectureLength : lec.length,
    video : {
      public_id : "temp",
      url : "tempurl",
    }
  }
  course.lectures.push(obj);
  await course.save();
  res.status(200).send({
    message : "Lecture added successfully",
    course
  })
});

const deleteLecture = catchAsyncError(async (req,res,next)=>{
  const courseId = req.query.cid;
  const educatorId = req.query.eid;
  const lectureId = req.query.lid;

  const course = await Course.findOne({_id : courseId});

  if (!course) {
    // If the course is not found, return a 404 Not Found status code.
    res.status(404).send({
      message: "Course not found",
    });
    return;
  }

  // Only who created that course can delete lectures to it.
  if(educatorId != course.educator.edId){
    // 401 status code for unauthorised access to the endpoint.
    res.status(401).send({
      message : "Only owner of this course can delete lectures to it."
    })
    return;
  }

  const updatedLectures = course.lectures.filter(lecture => lecture._id != lectureId);
  
  if (updatedLectures.length < course.lectures.length) {
    course.lectures = [...updatedLectures];
    await course.save();
    res.status(200).send({
      message: "Lecture deleted successfully in this course",
      course
    });
  } else {
    res.status(400).send({
      message: "Lecture not found",
      course
    });
  }

});

// Exporting all controller methods to their specified routes, here exporting to course.route.js
module.exports = {
  getAllCourses,
  createCourse,
  addLecture,
  deleteLecture,
  getCourseDetails
};
