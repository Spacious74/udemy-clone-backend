const UserProgress = require('../models/UserProgress.js');
const CourseModule = require('../models/CourseModules.js');
const DraftedCourse = require('../models/DraftedCourse.js');

const createUserProgress = async (req, res) => {

    try {
        const { userId, courseId } = req.body;

        // Check if already exists
        const existing = await UserProgress.findOne({ userId, courseId });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Progress already exists for this course",
                progress: existing
            });
        }

        // Get the course module (structure)
        const courseModule = await CourseModule.findOne({ courseId });
        if (!courseModule) {
            return res.status(404).json({
                success: false,
                message: "Course module not found"
            });
        }

        // Clone the structure
        const sectionArr = courseModule.sectionArr.map(section => ({
            sectionName: section.sectionName,
            videos: section.videos.map(video => ({
                public_id: video.public_id,
                url: video.url,
                name: video.name,
                position: video.position,
                completed: false
            }))
        }));

        // Default first video as last watched
        const firstVideo = sectionArr[0]?.videos[0]?._id || null;

        const newProgress = await UserProgress.create({
            userId,
            courseId,
            lastWatchedVideo: firstVideo,
            sectionArr
        });

        res.status(201).json({
            success: true,
            message: "User progress created successfully",
            progress: newProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}

const getUserProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.query;

        const playlist = await UserProgress.findOne({ userId, courseId });
        const course = await DraftedCourse.findOne({_id : courseId});
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Progress not found for this course"
            });
        }

        res.status(200).json({
            success: true,
            playlist,
            course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const updateProgress = async (req, res) => {
    try {

        const { userId, courseId, sectionId, videoId, action } = req.body;

        const progress = await UserProgress.findOne({ userId, courseId });
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: "Progress not found"
            });
        }

        let section = progress.sectionArr.find((sec) => sec._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found in progress"
            });
        }

        let video = section.videos.find((v) => v._id.toString() === videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found in section"
            });
        }

        // Update based on action
        if (action === "complete") video.completed = true;
        if (action === "resume") progress.lastWatchedVideo = videoId;

        // Update lastUpdated timestamp
        progress.lastUpdated = new Date();

        await progress.save();

        res.status(200).json({
            success: true,
            message: "Progress updated successfully",
            progress
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}


const updateCurrentWatchingLecture = async(req, res)=>{

}

module.exports = {
    getUserProgress,
    createUserProgress,
    updateProgress
}