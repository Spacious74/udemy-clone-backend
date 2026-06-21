const mongoose = require('mongoose');

const courseChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // or DraftedCourse depending on context
        required: true
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'model'],
                required: true
            },
            content: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

// Indexes for faster retrieval
courseChatSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseChat = mongoose.model('CourseChat', courseChatSchema);
module.exports = CourseChat;
