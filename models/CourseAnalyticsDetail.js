const mongoose = require('mongoose');

const courseAnalyticsDetailSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DraftedCourse',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentsEnrolled: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        }
    }],
    earnings: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const CourseAnalyticsDetail = mongoose.model('CourseAnalyticsDetail', courseAnalyticsDetailSchema);

module.exports = CourseAnalyticsDetail;
