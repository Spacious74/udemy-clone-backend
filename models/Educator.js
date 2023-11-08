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
    edQualifications : [String],
    profession : {
        type : String,
        required : true,
    }
})

const Educator = mongoose.model(educatorSchema, "Educator");
module.exports = Educator