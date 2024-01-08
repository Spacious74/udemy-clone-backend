const mongoose = require("mongoose");

const courseModuleSchema = new mongoose.Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Educator"
    },
    videoArr : [
        {
            sectionName : String,
            videos : [{
                vidLink : String,
                vidTitle : String,
            }]
        }
    ],

    createdAt : {
        type : Date,
        immutable : true,
        default : ()=> Date.now()
    },
    updatedAt : {
        type : Date,
        default : ()=> Date.now()
    }
});

const CourseModule = mongoose.model("CourseModule", courseModuleSchema);
module.exports = CourseModule;