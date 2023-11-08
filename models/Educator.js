const mongoose = require("mongoose");

const educatorSchema = mongoose.Schema({
    edname : {
        type : String, 
        required : [true,"Educator name is required"],
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