const mongoose = require('mongoose');
const User = require("./User")
const certificateSchema = new mongoose.Schema({

    certificateId: {type: String, required: true,unique: true,},

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },

    userName: { type: String, required: true, trim: true},

    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, },

    courseName: { type: String, required: true, trim: true},

    instructorName: { type: String, required: true, trim: true},

    pdfUrl: { type: String, required: true},

    verificationUrl: { type: String, required: true },

    issuedAt: { type: Date, default: Date.now, immutable: true },
    },
    {timestamps: true,}
);

const Certificate = mongoose.model("Certificate", certificateSchema);
module.exports = Certificate;