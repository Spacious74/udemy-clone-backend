const mongoose = require('mongoose')
const validator = require('validator');

// Creating a user schema to make a model of User using Schema method
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    headline : {
        type : String
    },
    email: {
        type: String,
        required: true,    
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },
    profileImage: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        trim: true,
        default: ''
    },
    coursesCreated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    coursesEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    progress: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completedLectures: { type: Number, default: 0 },
        totalLectures: { type: Number }
    }],
    socialLinks: {
        linkedin: { type: String, trim: true, default: '' },
        twitter: { type: String, trim: true, default: '' },
        github: { type: String, trim: true, default: '' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    notifications: [{
        type: { type: String },
        message: { type: String },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    isInstructor: {
        type: Boolean,
        default: false
    },
    earnings: {
        type: Number,
        default: 0
    },
    payoutMethod: {
        type: String,
        default: ''
    },
    certifications: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        certificateUrl: { type: String, trim: true }
    }],
    bookmarkedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]

}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
  })

const User = mongoose.model("User", userSchema);
module.exports = User