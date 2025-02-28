// Importing Course db model
const Course = require("../models/Course");
const CustomErrorHandler = require("../utils/customErrorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const CourseModule = require("../models/CourseModules");
const Review = require("../models/Review");
const QueAns = require("../models/QueAns");

const getCourseDetails = async (req, res, next) => {
  const cId = req.params.cId;
  try {
    const course = await Course.findOne({ _id: cId });
    const reviews = await Review.findOne({ courseId: cId });
    if (!course) {
      res.status(404).send({
        message: "Course not found. We are contacting to educator.",
      });
    }
    res.status(200).send({
      message: "Course details fetched successfully",
      course,
      reviews
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};

const getCourseByEdIdAndCourseId = async(req, res)=>{
  const courseId = req.query.courseId;
  const educatorId = req.query.edId;
  try {
    const course = await Course.findOne({_id : courseId, "educator.edId": educatorId});
    if(!course){
      res.status(404).send({
        message: "Course not found.",
        success : false,
        data : undefined
      });
    }
    res.status(200).send({
      message: "Course details fetched successfully",
      success: true,
      data : course
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
      success : false
    });
  }
}

const getAllCourses = async (req, res) => {
  const page = req.query.page;
  const limit = 10;
  const skip = (page) * limit;
  const min = Number(req.query.min);
  const max = Number(req.query.max);
  const sortedOrder = req.query.sortOrder;
  const category = req.query.category;
  const language = req.query.language;
  const level = req.query.level;
  const searchText = req.query.searchText;
  let totalResults = await Course.find();
  try {
    let query = {};

    if (searchText) {
      query.$or = [
        { title: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
        { category: { $regex: searchText, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (language) {
      query.language = language;

    }

    if (level) {
      query.level = level;
    }

    if (min && max) {
      query.price = { $gte: min, $lte: max };
    } else if (min) {
      query.price = { $gte: min };
    } else if (max) {
      query.price = { $lte: max };
    }

    totalResults = await Course.find(query);
    let filteredResults = await Course.find(query).skip(skip).limit(limit);

    if (sortedOrder == "lth") {
      filteredResults = await Course.find(query).sort({ price: 1 }).skip(skip).limit(limit);
    } else if (sortedOrder == "htl") {
      filteredResults = await Course.find(query).sort({ price: -1 }).skip(skip).limit(limit);
    } else if (sortedOrder == "") {
      filteredResults = await Course.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    if (filteredResults.length < 1) {
      res.status(400).send({
        message: "Course not found in database",
      });
      return;
    }
    res.status(200).send({
      totalCourses: totalResults.length,
      filteredResults,
    });
  } catch (e) {
    res.status(500).send({
      message: "Some internal error occurred !",
      error: e.message,
    });
  }
};

const createCourse = async (req, res, next) => {

  const { title, subTitle, description, category, subCategory, price, language, level, educator, totalStudentsPurchased } = req.body;

  if ( !title || !description || !category || !educator || !price || !language || !level ) {
    res.status(500).send({
      message: "Missing required information!",
      error: "Error",
    });
  }

  try {
    const coursemade = await Course.create({ title, subTitle, description, category, subCategory, price, language, 
      level, educator, totalStudentsPurchased,
      coursePoster: {
        public_id: "temp",
        url: "temp",
      },
    });

    await CourseModule.create({
      courseId: coursemade._id,
    });

    await Review.create({
      courseId: coursemade._id,
    });

    await QueAns.create({
      courseId: coursemade._id,
    });

    res.status(200).send({
      data : coursemade,
      success: true,
      message: "Course and its module added successfully",
    });

  } catch (error) {
    res.status(500).send({
      message: "Some iternal error occurred",
      error: error.message,
    });
  }
};

const deleteCourse = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new CustomErrorHandler("Some backend error occured", 500));
  }
  await Course.deleteOne({ _id: id });
  await CourseModule.deleteOne({ courseId: id });

  res.status(200).send({
    success: true,
    message: "Course and its course Module has been deleted!",
  });
});

const updateCourse = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new CustomErrorHandler("Some backend error occured", 500));
  }
  const updatedData = req.body;
  const newCourse = await Course.findByIdAndUpdate({ _id: id }, updatedData, {
    new: true,
    runValidators: true,
  });
  res.status(200).send({
    success: true,
    message: "Course has been updated successfully!",
    course: newCourse,
  });
});

const getAllCoursesByCategory = async (req, res) => {
  const category = req.params.category;
  console.log(category);
  try {
    const courses = await Course.find({ category: category });
    if (courses.length == 0 || !courses) {
      res.status(404).send({
        message: "Category not found",
      });
      return;
    }
    res.status(200).send({
      success: true,
      totalCourses: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};



module.exports = {
  getAllCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  getCourseDetails,
  getAllCoursesByCategory,
  getCourseByEdIdAndCourseId
};
