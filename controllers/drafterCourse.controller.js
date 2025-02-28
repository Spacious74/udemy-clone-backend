const DraftedCourse = require('../models/DraftedCourse')
const CustomErrorHandler = require("../utils/customErrorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const CourseModule = require("../models/CourseModules");
const Review = require("../models/Review");
const QueAns = require("../models/QueAns");
const cloudinary = require('cloudinary').v2;

const getAllCoursesByEdId = async (req, res) => {
    const educatorId = req.query.educatorId;
    try {
        const courses = await DraftedCourse.find({ "educator.edId": educatorId });
        if (!courses || courses.length < 1) {
            res.status(200).send({
                message: "Drafted Courses not found!",
            }); return;
        }
        res.status(200).send({
            success: true,
            message: "Course fetched successfully.",
            data: courses
        })
    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred",
            error: error.message,
        });
    }
};

const getOneCourseById = async (req, res) => {
    const courseId = req.query.courseId;
    try {
        const course = await DraftedCourse.find({ _id: courseId });
        if (!course) {
            res.status(500).send({
                message: "Drafted Course not found!",
            });
        }
        const courseModule = await CourseModule.findOne({ courseId: courseId });
        res.status(200).send({
            success: true,
            message: "Course fetched successfully.",
            data: {
                ...course,
                courseModuleId: courseModule._id
            }
        })

    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred",
            error: error.message,
        });
    }
};


const getCourseByEdIdAndCourseId = async(req, res)=>{
    const courseId = req.query.courseId;
    const educatorId = req.query.educatorId;
    try {
      const course = await DraftedCourse.findOne({_id : courseId, "educator.edId": educatorId});
      const courseModule = await CourseModule.findOne({ courseId: courseId });
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
        data: {
            ...course?._doc,
            courseModuleId: courseModule._id
        }
      });
    } catch (error) {
      res.status(500).send({
        message: "Some internal error occurred",
        error: error.message,
        success : false
      });
    }
}

const createCourse = async (req, res, next) => {
    const { title, subTitle, description, category, subCategory,
        price, language, level, educator,} = req.body;

    if (!title || !description || !category || !educator || !price || !language || !level) {
        res.status(500).send({
            message: "Missing required information!",
            error: "Error",
        });
    }
    try {
        const coursemade = await DraftedCourse.create({
            title, subTitle, description, category, subCategory, price,
            language, level, educator, coursePoster : {
                public_id : "",
                url : "",
            }
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
            data: coursemade,
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

const deleteImageFromCloudinary = async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy('SkillUp_CourseThumbnail/' + publicId);
      console.log(result);
      if (result.result === 'ok') {
        return { success: true, message: 'Image deleted successfully.' };
      } else {
        return { success: false, message: 'Image deletion failed.', result };
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, message: 'An error occurred during image deletion.', error: error.message };
    }
};

const uploadThumbnail = async (req, res) => {
    try {
        const file = req.files.file;
        const courseId = req.query.courseId;

        const course = await DraftedCourse.findById({ _id: courseId });
        if (course.coursePoster.url != '') {
            const publicId = course.coursePoster.public_id.split('/')[1]; //"SkillUp_CourseThumbnail/dhscfeixwdgl3z5ehi6k
            const deleteResult = await deleteImageFromCloudinary(publicId);
            if (deleteResult.success) {
                course.coursePoster.url = undefined;
                course.coursePoster.public_id=undefined;
                await course.save();
            } else {
                return res.status(500).json({ message: deleteResult.message });
            }
        }

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.', success: false });
        }
        const base64Data = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
        const result = await cloudinary.uploader.upload(base64Data, {
            folder: 'SkillUp_CourseThumbnail',
        });

        course.coursePoster.url = result.secure_url;
        course.coursePoster.public_id = result.public_id;
        await course.save();

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully.',
            data: course,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Image upload failed.', error: error.message });
    }
};

const deleteUploadedImage = async (req, res) => {

    const courseId = req.query.courseId;
    try {
      const course = await DraftedCourse.findById({_id : courseId});
    
      const publicId = course.coursePoster.public_id.split('/')[1]; // Extract public ID from URL
      const deleteResult = await deleteImageFromCloudinary(publicId);
  
      if (deleteResult.success) {
        course.coursePoster.url = '';
        course.coursePoster.public_id = '';
        await course.save();
        return res.status(200).json({ success: true, message: 'Thumbnail removed successfully.', data: course });
      } else {
        return res.status(500).json({ success: false, message: deleteResult.message });
      }
  
    } catch (error) {
      return res.status(500).json({success: false, message: 'Internal server error.', error: error.message });
    }
  }

// Hello this is comment
const updateCourse = catchAsyncError(async (req, res, next) => {

    const id = req.query.courseId;

    if (!id) {
        return next(new CustomErrorHandler("Some backend error occured", 500));
    }

    try {
        const updatedData = req.body;
        const newCourse = await DraftedCourse.findByIdAndUpdate(
            { _id: id }, updatedData, { new: true, runValidators: true }
        );
        res.status(200).send({
            success: true,
            message: "Course has been updated successfully!",
            course: newCourse,
        });
    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred",
            error: error.message,
            success : false
        });
    }

});

module.exports = {
    createCourse,
    getAllCoursesByEdId,
    updateCourse,
    getOneCourseById,
    uploadThumbnail,
    getCourseByEdIdAndCourseId,
    deleteUploadedImage
}