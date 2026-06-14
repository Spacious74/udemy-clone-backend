const CourseAnalyticsDetail = require('../models/CourseAnalyticsDetail');
const DraftedCourse = require('../models/DraftedCourse');

const getTeacherAnalytics = async (req, res) => {
    try {
        const teacherId = req.user.uid; 
        if (!teacherId) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized access"
            });
        }

        const courses = await DraftedCourse.find({ "educator.edId": teacherId });

        const analytics = await CourseAnalyticsDetail.find({ teacherId })
            .populate('courseId')
            .populate('studentsEnrolled.studentId', 'username email role profileImage createdAt');

        res.status(200).send({
            success: true,
            courses: courses,
            data: analytics,
            message: "Analytics fetched successfully"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error fetching analytics",
            error: error.message
        });
    }
}

module.exports = {
    getTeacherAnalytics
};
