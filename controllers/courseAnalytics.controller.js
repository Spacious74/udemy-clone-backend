const CourseAnalyticsDetail = require('../models/CourseAnalyticsDetail');

const getTeacherAnalytics = async (req, res) => {
    try {
        const teacherId = req.user.uid; 
        if (!teacherId) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized access"
            });
        }

        const analytics = await CourseAnalyticsDetail.find({ teacherId }).populate('studentsEnrolled.studentId', 'username email role profileImage createdAt');

        res.status(200).send({
            success: true,
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
