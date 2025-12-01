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

    lastWatchedVideo:String,

    sectionArr: [
      {
        sectionId : String,
        sectionName: {
          type: String,
          required: true
        },
        videos: [
          {
            videoId : String,
            public_id: String,
            url: String,
            name: String,
            position: Number,
            completed: {
              type: Boolean,
              default: false
            }
          }
        ]
      }
    ],

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
