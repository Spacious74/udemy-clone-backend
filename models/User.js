const mongoose = require('mongoose')
const validator = require('validator');

// Creating a user schema to make a model of User using Schema method
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : [true, "Please enter your name."]
    },
    email : {
        type : String,
        required : [true, "Please enter your email"],
        unique : true,
        validate :  validator.isEmail
    },
    password : {
        type : String,
        required : [true, "Please enter your password"],
        minLength : [8, "Password must be at least 8 characters long."],
    }, 
    profilePicture : {
        public_id :{
            type : String,
            required :  true,
        },
        url : {
            type : String,
            required :  true,
        }, 
    },
    playlist : [
        {
            courseId  : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Course"
            },
            coursePoster : {
                type : String
            },
            courseTitle : {
                type : String
            },
            instructor : String,
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
    },
    
    // This token is used while user trying to recreate a new password
    resetPasswordToken : String,

    // This stores the token expire time when user sending the otp to change the password
    resetPasswordExpire : String

})

const User = mongoose.model("User",userSchema);
module.exports = User