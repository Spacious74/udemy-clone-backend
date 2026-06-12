const mongoose = require('mongoose');

const courseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    }
});

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);
module.exports = CourseCategory;
