const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DraftedCourse",
        required: true
    },
    lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    questionTitle: {
        type: String,
        required: true
    },
    questionDescription: {
        type: String,
        required: true
    },
    answerCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
