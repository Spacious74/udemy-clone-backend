const CourseModule = require("../models/CourseModules");
const CustomErrorHandler = require("../utils/customErrorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const cloudinary = require("cloudinary").v2;


const getAllSections = async (req, res) => {
    const courseId = req.query.courseId;
    try {
        const videoModule = await CourseModule.findOne({ courseId: courseId });
        if (!videoModule) {
            res.status(500).send({
                message: "No sections found",
                error: "Error while fetching sections of this course",
                success: false
            });
        }
        res.status(200).send({
            message: "Course Sections fetched successfully",
            success: true,
            data: videoModule.sectionArr
        })
    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred",
            error: error.message,
            success: false
        });
    }

}


const addSection = async (req, res) => {

    const id = req.query.courseId;
    const { sectionName } = req.body;
    console.log(req.body);

    try {
        const module = await CourseModule.findOne({ courseId: id });
        if (!sectionName) {
            res.status(500).send({
                message: "Missing section name",
                error: "Enter required fields to save this record",
                success: false
            });
            return;
        }
        module.sectionArr.push({
            sectionName: req.body.sectionName,
        });
        await module.save();
        res.status(200).send({
            message: "Section added successfully...",
            success: true,
            data: module.sectionArr
        });

    } catch (error) {

        res.status(500).send({
            message: "Some iternal error occurred",
            error: error.message,
            success: false
        });

    }

};

const deleteSection = async (req, res) => {

    const sectionId = req.query.sectionId;
    const courseId = req.query.courseId;

    try {
        const module = await CourseModule.findOne({ courseId: courseId });
        module.sectionArr.pull({ _id: sectionId });
        await module.save();
        res.status(200).send({
            message: "Section removed successfully.",
            success: true,
            data: module.sectionArr
        });

    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred",
            error: error.message,
            success: false
        });
    }

};

const updateSection = async (req, res) => {

    const sectionId = req.query.sectionId;
    const courseId = req.query.courseId;

    try {
        const module = await CourseModule.findOne({ courseId: courseId });
        let newName = req.body.sectionName;

        const sectionIndex = module.sectionArr.findIndex(section => section._id == sectionId);

        if (!req.body.sectionName) {
            newName = module.sectionArr[sectionIndex].sectionName;
            res.status(500).send({
                message: "Section name is required to update.",
                error: "Error",
                success: false
            });
        }

        module.sectionArr[sectionIndex].sectionName = newName;

        await module.save();

        res.status(200).send({
            message: "Section name updated successfully",
            success: true,
            data: module.sectionArr
        })
    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred",
            error: error.message,
            success: false
        });
    }


}

const addVideoToSection = async (req, res, next) => {
    const { videoTitle } = req.body;
    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    try {
        const module = await CourseModule.findOne({ courseId: courseId });
        const sectionIndex = module.sectionArr.findIndex(section => section._id == sectionId);
        module.sectionArr[sectionIndex].videos.push({ name: videoTitle });
        await module.save();
        res.status(200).send({
            message: "Video uploaded successfully",
            success: true,
            data: module.sectionArr
        });
    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred",
            error: error.message,
            success: false
        });
    }
};



const deleteVideo = async (req, res, next) => {

    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    const videoId = req.query.videoId;
    try {
        const module = await CourseModule.findOne({ courseId: courseId });
        const sectionIndex = module.sectionArr.findIndex(section => section._id == sectionId);
        const videoIndex = module.sectionArr[sectionIndex].videos.findIndex(video => video._id == videoId);
        let videoPublicId = module.sectionArr[sectionIndex].videos[videoIndex].public_id;
        if (module.sectionArr[sectionIndex].videos[videoIndex].public_id) {
            const result = await cloudinary.uploader.destroy('course-website/' + videoPublicId, { resource_type: 'video' });
            if (result.result == 'ok') {
                module.sectionArr[sectionIndex].videos[videoIndex].public_id = "";
                module.sectionArr[sectionIndex].videos[videoIndex].url = "";
            } else {
                res.status(500).send({
                    message: "Some iternal error occurred",
                    error: "Error while deleting video from cloudinary",
                    success: false
                });
            }
        }
        module.sectionArr[sectionIndex].videos.pull({ _id: videoId });
        await module.save();
        res.status(200).send({
            message: "Video deleted successfully!!!",
            success: true,
            data: module.sectionArr
        });
    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred",
            error: error.message,
            success: false
        });
    }

};

const updateVideoTitle = catchAsyncError(async (req, res, next) => {

    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    const videoId = req.query.videoId;
    let newName = req.body.videoTitle;

    const module = await CourseModule.findOne({ courseId: courseId });
    const sectionIndex = module.sectionArr.findIndex(section => section._id == sectionId);
    const videoIndex = module.sectionArr[sectionIndex].videos.findIndex(video => video._id == videoId);
    if (!req.body.videoTitle) {
        newName = module.sectionArr[sectionIndex].videos[videoIndex].name
    }
    module.sectionArr[sectionIndex].videos[videoIndex].name = newName;

    await module.save();

    res.status(200).send({
        message: "Video title updated successfully",
        success: true,
        data: module.sectionArr
    });

});

const addVideoFile = async (req, res) => {
    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    const videoId = req.query.videoId;
    let { public_id, url } = req.body;

    try {
        const module = await CourseModule.findOne({ courseId: courseId });
        const sectionIndex = module.sectionArr.findIndex(section => section._id == sectionId);
        const videoIndex = module.sectionArr[sectionIndex].videos.findIndex(video => video._id == videoId);

        module.sectionArr[sectionIndex].videos[videoIndex].public_id = public_id;
        module.sectionArr[sectionIndex].videos[videoIndex].url = url;
        await module.save();

        res.status(200).send({
            message: "Video file uploaded successfully.",
            success: true,
            data: module.sectionArr
        });

    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred!",
            error: error.message,
            success: false
        });
    }
}

const updateVideoFile = async (req, res) => {

    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    const videoId = req.query.videoId;
    let { public_id, url } = req.body;

    try {

        const module = await CourseModule.findOne({ courseId: courseId });
        const sectionIndex = module.sectionArr.findIndex(section => section._id == sectionId);
        const videoIndex = module.sectionArr[sectionIndex].videos.findIndex(video => video._id == videoId);
        let videoPublicId = module.sectionArr[sectionIndex].videos[videoIndex].public_id;
        if (module.sectionArr[sectionIndex].videos[videoIndex].public_id) {
            const result = await cloudinary.uploader.destroy('course-website/' + videoPublicId, { resource_type: 'video' });
            if (result.result == 'ok') {
                module.sectionArr[sectionIndex].videos[videoIndex].public_id = "";
                module.sectionArr[sectionIndex].videos[videoIndex].url = "";
            } else {
                res.status(500).send({
                    message: "Some iternal error occurred",
                    error: "Error while deleting video from cloudinary",
                    success: false
                });
            }
        }
        module.sectionArr[sectionIndex].videos[videoIndex].public_id = public_id;
        module.sectionArr[sectionIndex].videos[videoIndex].url = url;
        await module.save();

        res.status(200).send({
            message: "Video file updated successfully.",
            success: true,
            data: module.sectionArr
        });

    } catch (error) {
        res.status(500).send({
            message: "Some iternal error occurred!",
            error: error.message,
            success: false
        });
    }
}

module.exports = {
    addSection,
    deleteSection,
    getAllSections,
    updateSection,
    addVideoToSection,
    updateVideoTitle,
    deleteVideo,
    addVideoFile,
    updateVideoFile
}