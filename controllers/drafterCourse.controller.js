const DraftedCourse = require('../models/DraftedCourse')
const CustomErrorHandler = require("../utils/customErrorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const CourseModule = require("../models/CourseModules");
const Review = require("../models/Review");
const QueAns = require("../models/QueAns");
const cloudinary = require('cloudinary').v2;

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

        query.isReleased = true; // Only fetch released courses

        totalResults = await DraftedCourse.find(query);
        let filteredResults = await DraftedCourse.find(query).skip(skip).limit(limit);

        if (sortedOrder == "lth") {
            filteredResults = await DraftedCourse.find(query).sort({ price: 1 }).skip(skip).limit(limit);
        } else if (sortedOrder == "htl") {
            filteredResults = await DraftedCourse.find(query).sort({ price: -1 }).skip(skip).limit(limit);
        } else if (sortedOrder == "") {
            filteredResults = await DraftedCourse.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        }

        if (filteredResults.length < 1) {
            res.status(400).send({
                message: "Course not found in database",
                success: false
            });
            return;
        }
        res.status(200).send({
            totalCourses: totalResults.length || 0,
            data: filteredResults,
            success: true
        });

    } catch (e) {
        res.status(500).send({
            message: "Some internal error occurred !",
            error: e.message,
            success: false
        });
    }
};

const getCourseDetails = async (req, res) => {
    const cId = req.query.courseId;
    try {
        const course = await DraftedCourse.findOne({ _id: cId }).populate('educator.edId', 'username profileImage');
        const reviews = await Review.findOne({ courseId: cId });
        if (!course) {
            res.status(404).send({
                message: "Course not found. Something went wrong!",
                success: false,
            });
        }
        res.status(200).send({
            message: "Course details fetched successfully",
            course,
            reviews,
            success: true
        });
    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred",
            error: error.message,
            success: false
        });
    }
};

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

const getReleaseCourseByEdId = async (req, res) => {
    const educatorId = req.query.educatorId;
    try {
        const courses = await DraftedCourse.find({ "educator.edId": educatorId, isReleased: true });
        if (!courses || courses.length < 1) {
            res.status(200).send({
                message: "Released Courses not found!",
            }); return;
        }
        res.status(200).send({
            success: true,
            message: "Released Course fetched successfully.",
            data: courses
        })
    }
    catch (error) {
        res.status(500).send({
            message: "Some internal error occurred",
            error: error.message,
            success: false
        });
    }
}

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

const getCourseByEdIdAndCourseId = async (req, res) => {
    const courseId = req.query.courseId;
    const educatorId = req.query.educatorId;
    try {
        const course = await DraftedCourse.findOne({ _id: courseId, "educator.edId": educatorId });
        const courseModule = await CourseModule.findOne({ courseId: courseId });
        if (!course) {
            res.status(404).send({
                message: "Course not found.",
                success: false,
                data: undefined
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
            success: false
        });
    }
}

const createCourse = async (req, res, next) => {
    const { title, subTitle, description, category, subCategory,
        price, language, level, educator, } = req.body;

    if (!title || !description || !category || !educator || !price || !language || !level) {
        res.status(500).send({
            message: "Missing required information!",
            error: "Error",
        });
    }
    try {
        const coursemade = await DraftedCourse.create({
            title, subTitle, description, category, subCategory, price,
            language, level, educator, coursePoster: {
                public_id: "",
                url: "",
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
                course.coursePoster.public_id = undefined;
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
        const course = await DraftedCourse.findById({ _id: courseId });

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
        return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
    }
}

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
            success: false
        });
    }

});

const releaseCourse = async (req, res) => {
    const courseId = req.query.courseId;
    try {
        const course = await DraftedCourse.findOne({ _id: courseId });
        course.isReleased = true;
        await course.save();
        res.status(200).send({
            data: "Course released successfully! Now students can see your created course.",
            message: "Course released successfully!",
            success: true,
        });
    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred",
            error: error.message,
            success: false,
        })
    }
}

const unpublishCourse = async(req, res)=>{
    const courseId = req.query.courseId;
    try {
        const course = await DraftedCourse.findOne({ _id: courseId });
        course.isReleased = false;
        await course.save();
        res.status(200).send({
            data: "Course unpublished successfully! Now students can't see your created course.",
            message: "Course unpublished successfully!",
            success: true,
        });
    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred",
            error: error.message,
            success: false,
        })
    }
}

const deleteCourse = async(req, res)=>{
    const courseId = req.query.courseId;
    try {

        const course = await DraftedCourse.findOne({ _id: courseId });
        if (!course) {
            return res.status(404).send({
                message: "Course not found!",
                success: false,
            });
        }

        const courseModule = await CourseModule.findOne({ courseId: courseId });
        if (courseModule) {
            await CourseModule.deleteOne({ courseId: courseId });
        }

        const deleteResult = await deleteImageFromCloudinary(course.coursePoster.public_id.split('/')[1]);
        if (!deleteResult.success) {
            return res.status(500).send({
                message: "Failed to delete course thumbnail from cloud.",
                success: false,
            });
        }

        await DraftedCourse.deleteOne({ _id: courseId });

        return res.status(200).send({
            message: "Course deleted successfully!",
            success: true,
        });

    } catch (error) {
        return res.status(500).send({
            message: "Some internal error occurred",
            error: error.message,
            success: false,
        });
    }

}

module.exports = {
    getAllCourses,
    getAllCoursesByEdId,
    getOneCourseById,
    getCourseByEdIdAndCourseId,
    getCourseDetails,
    createCourse,
    updateCourse,
    uploadThumbnail,
    deleteUploadedImage,
    releaseCourse,
    unpublishCourse,
    getReleaseCourseByEdId,
    deleteCourse
}