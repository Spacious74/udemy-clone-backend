const mongoose = require('mongoose')

// title, subTitle description, category, subCategory, price, language, level, educator: edId, edname,, totalStudentsPurchased
const draftedCourseSchema = new mongoose.Schema({

    // Name of course
    title : {
        type : String,
        required : [true, "Course title is required"],
        minLength : [8, "Title must be at least 8 characters long"],
        maxLength : [100, "Title can be more than 100 characters"],
    }, 
    subTitle : String,
    // Course description what course want to educate.
    description : {
        type : String,
        required : [true, "Course description is required"],
        minLength : [8, "Course Description must be at least 8 characters long"],
    },  
    ratings : Number,
    // Which category belong a course
    category : {
        type : String,
        reuqired : [true, "Category is required"]
    },
    subCategory : String,
    price : Number,
    language : String,
    level : String,

    // Who is the educator of this course
    educator : {
        edId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Educator"
        },
        edname : {
            type : String,
            required : true,
        }
    },
    coursePoster : {
        public_id :{
            type : String,
        },
        url : {
            type : String,
        },
    },
    totalStudentsPurchased : {
        type : Number,
        default : 0
    },
    isReleased : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        immutable : true,
        default : ()=> Date.now()
    },
    updatedAt : {
        type : Date,
        default : ()=> Date.now()
    }

})

const DraftedCourse = mongoose.model("DraftedCourse", draftedCourseSchema);
module.exports = DraftedCourse;