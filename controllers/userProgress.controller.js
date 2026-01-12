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
        const videosProgress = await UserProgress.findOne({ userId, courseId });
        if (!videosProgress) {
            return res.status(404).json({
                success: false,
                message: "Progress not found for this course"
            });
        }
        res.status(200).json({
            success: true,
            videosProgress,
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

const getVideoDirectly = async (req, res) => {
    const { userId, courseId, currentVideoId, reqVideoId, percentage } = req.query;
    try {
        const userProgress = await UserProgress.findOne({ userId: userId, courseId: courseId });
        const courseModule = await CourseModule.findOne({ courseId: courseId });
        const allVideosFlat = courseModule.sectionArr.flatMap(section => section.videos);
        const videoObj = allVideosFlat.find(video => video._id.toString() == reqVideoId);
        const resVideoIndex = allVideosFlat.findIndex(video => video._id.toString() === reqVideoId);
        userProgress.currentWatchingVideo = {
            videoId: videoObj._id,
            videoTitle: videoObj.name,
            videoUrl: videoObj.url,
            videoPublic_Id: videoObj.public_id,
            globalVideoIdx: resVideoIndex
        }

        let videoSet = new Set(userProgress.videosCompleted);
        if (percentage > 90 && !videoSet.has(currentVideoId.trim())) {
            userProgress.videosCompleted.push(currentVideoId.trim());
        }

        await userProgress.save();

        res.status(200).send({
            success: true,
            videosProgress: userProgress
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
}

const markVideoComplete = async (req, res) => {
    const { userId, courseId, currentVideoId } = req.query;
    try {
        const userProgress = await UserProgress.findOne({ userId: userId, courseId: courseId });
        userProgress.videosCompleted.push(currentVideoId.trim());
        await userProgress.save();
        res.status(200).send({
            success: true,
            videosProgress: userProgress
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
}

const playNextVideo = async (req, res) => {
    // Meaning : Next video ka data bhejo, 1. sabse phle current watching video object nikalo, unke indexes uthao
    // - phle check karo globalIdx == totalFlattened array ke to course complete
    // - flattened array ke current globalIdx+1 ka obj send kar do.
    // - globalIdx update kar do

    const { progressId } = req.query;
    try {
        const userProgress = await UserProgress.findOne({ _id: progressId });
        const allVideos = userProgress.sectionArr.flatMap(section => section.videos);

        let currentVideoIdx = userProgress.currentWatchingVideo.globalVideoIdx
        if (currentVideoIdx == allVideos.length - 1) {
            return res.status(200).send({
                success: true,
                message: "You've completed the course",
                currentWatchingVideo: null
            })
        }

        userProgress.currentWatchingVideo = {
            videoId: allVideos[currentVideoIdx + 1].videoId,
            videoTitle: allVideos[currentVideoIdx + 1].name,
            videoUrl: allVideos[currentVideoIdx + 1].url,
            videoPublic_Id: allVideos[currentVideoIdx + 1].public_id,
            globalVideoIdx: currentVideoIdx + 1
        }

        await userProgress.save();

        res.status(200).send({
            success: true,
            message: "Video Fetched Successfully.",
            currentWatchingVideo: userProgress.currentWatchingVideo
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}

module.exports = {
    getUserProgress,
    createUserProgress,
    updateProgress,
    getVideoDirectly,
    markVideoComplete
}