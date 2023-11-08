const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({

    // Name of course
    title : {
        type : String,
        required : [true, "Course title is required"],
        minLength : [8, "Title must be at least 8 characters long"],
        maxLength : [100, "Title can be more than 100 characters"],
    }, 
    // Course description what course want to educate.
    description : {
        type : String,
        required : [true, "Course description is required"],
        minLength : [8, "Course Description must be at least 8 characters long"],
    },  
    coursePoster : {
        public_id :{
            type : String,
            required :  true,
        },
        url : {
            type : String,
            required :  true,
        },
    },

    // Lecutures array stores the videos link, posters, length of video.
    lectures : [
        {
            lecuterTitle : {
                type : String,
                required : [true, "Lecture title is required"],
            },
            lectureLength : {
                type : String,
                reqiured : [true, "Lecture length is required"],
            },
            video : {
                public_id :{
                    type : String,
                    required :  true,
                },
                url : {
                    type : String,
                    required :  true,
                },
            }

        }
    ],

    // No. of views of that course
    views : {
        type : Number,
        default : 0
    },

    // How many lectures are there in this course
    noOfLecuters : {
        type : Number,
        default : 0
    },

    // Which category belong a course
    category : {
        type : String,
        reuqired : [true, "Category is required"]
    },

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

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;