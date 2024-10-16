const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  reviewArr: [
    {
    userId : mongoose.Schema.Types.ObjectId,
    username : String,
    rating : Number,
    desc : String
    }
  ],
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
