const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Course"
    },
    qaArr : [
        {
            question : String,
            lectureNo : Number,
            userId : mongoose.Schema.Types.ObjectId,
            username : String,
            ansArr : [
                {
                    userId : mongoose.Schema.Types.ObjectId,
                    username : String,
                    answer : String
                }
            ]
        }
    ]
})

const QueAns = mongoose.model("QueAns", qaSchema);
module.exports = QueAns;