const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  overallRating: {
    type: Number,
    default: 0
  },
  reviewArr: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      rating: Number,
      desc: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now

  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
