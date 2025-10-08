const mongoose = require("mongoose");

const courseModuleSchema = new mongoose.Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Course"
    },
    sectionArr : [
        {
            sectionName : String,
            videos : [{
                public_id : String,
                url : String,
                name : String,
                position : Number
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