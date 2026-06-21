const mongoose = require('mongoose');

const dailyAILimitSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: String, // Format YYYY-MM-DD
        required: true
    },
    totalQuestions: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to quickly find a limit entry by identifier and date
dailyAILimitSchema.index({ identifier: 1, date: 1 }, { unique: true });

const DailyAILimit = mongoose.model('DailyAILimit', dailyAILimitSchema);
module.exports = DailyAILimit;
