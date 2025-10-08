const DraftedCourse = require('../models/DraftedCourse');
const CourseModule = require('../models/CourseModules');

const getOneVideoById = async (req, res) => {
    const { courseId, sectionId, videoId } = req.query;
    try {
        const courseModule = await CourseModule.findOne({ courseId: courseId });
        if (!courseModule) {
            return res.status(400).send({
                message: "Something went wrong!",
                success: false
            });
        }

        let section = courseModule.sectionArr.find((sec) => sec._id.toString() === sectionId);
        if (!section) {
            return res.status(404).send({ message: "Section not found", success: false });
        }

        let video = section.videos.find((vid) => vid._id.toString() === videoId);
        if (!video) {
            return res.status(404).send({ message: "Video not found", success: false });
        }

        res.status(200).send({
            videoUrl: video.url??"Coming soon...",
            success: true
        })

    } catch (err) {
        res.status(500).send({
            message: "Some internal error occurred !",
            error: err.message,
            success: false
        });
    }
}

// const 

module.exports = {
    getOneVideoById
}