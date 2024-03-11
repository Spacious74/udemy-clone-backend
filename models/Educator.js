const mongoose = require("mongoose");
const validator = require('validator');

const educatorSchema = mongoose.Schema({
    edname : {
        type : String, 
        required : [true,"Educator name is required"],
    },
    edEmail : {
        type : String,
        required : [true,"Educator email is required"],
        unique : true,
        validate : validator.isEmail
    },
    edPassword : {
        type : String,
        required : [true, "Please enter your password"],
        minLength : [8, "Password must be at least 8 characters long."],
        select : false,
    },
    edProfilePicture : {
        public_id : {
            type : String,
            required : true,
        },
        url : {
            type : String,
            required : true,
        }
    },
    experience : {
        type : Number,
        default : 0
    },
    proffession : {
        type : String,
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

const Educator = mongoose.model("Educator",educatorSchema);
module.exports = Educator