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
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseCategory",
        default: null
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    }
});

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);
module.exports = CourseCategory;
