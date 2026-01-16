const { generateCertificatePDF } = require("../services/certificate.service");
const DraftedCourse = require('../models/DraftedCourse');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Certificate = require('../models/Certificate');

const generateCertificate = async (req, res) => {
    const { userId, courseId } = req.body;

    try {

        const user = await User.findOne({ _id: userId });
        const course = await DraftedCourse.findOne({ _id: courseId });
        const userProgress = await UserProgress.findOne({ userId: userId, courseId: courseId });

        if (userProgress.videosCompleted.length != course.totalLectures) {
            return res.status(500).send({
                message: "Not eligible for certification",
                success: false
            });
        }

        const existingCert = await Certificate.findOne({ userId, courseId });
        if (existingCert) {
            return res.status(200).send({
                success: true,
                pdfUrl: existingCert.pdfUrl
            });
        }

        const certificateId = "CERT-" + Date.now();
        const pdfPath = await generateCertificatePDF({
            userName: user.username,
            courseName: course.title,
            instructorName: course.educator.edname,
            certificateId
        });

        await Certificate.create({
            certificateId: certificateId,
            userId: user._id,
            userName: user.username,
            courseId: course._id,
            courseName: course.title,
            instructorName: course.educator.edname,
            pdfUrl: pdfPath,
            verificationUrl : pdfPath,
        });

        res.status(200).send({
            success: true,
            pdfUrl: pdfPath
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }

};

module.exports = {
    generateCertificate
}