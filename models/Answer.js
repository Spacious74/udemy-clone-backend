const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    isInstructorAnswer: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Answer = mongoose.model("Answer", answerSchema);
module.exports = Answer;
