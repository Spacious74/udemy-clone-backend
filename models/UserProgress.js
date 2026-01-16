const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DraftedCourse",
      required: true
    },

    currentWatchingVideo: {
      videoId : String, 
      videoTitle : String,
      videoUrl : String, 
      videoPublic_Id : String,
      globalVideoIdx : {
        type : Number, 
        default : 0
      },
    },

    videosCompleted: [
      { type : String }
    ],

    courseCompletionStatus : Boolean,

    startedAt: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // auto adds createdAt and updatedAt
  }
);


const UserProgress = mongoose.model("UserProgress", userProgressSchema);
module.exports = UserProgress;
