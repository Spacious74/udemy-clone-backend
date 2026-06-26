const Question = require('../models/Question');
const Answer = require('../models/Answer');
const DraftedCourse = require('../models/DraftedCourse')
const CourseModule = require('../models/CourseModules');
const catchAsyncError = require('../middlewares/catchAsyncError');

exports.createQuestion = catchAsyncError(async (req, res) => {
    const { courseId, lectureId, questionTitle, questionDescription } = req.body;
    const userId = req.user.uid;

    const newQuestion = await Question.create({
        courseId,
        lectureId,
        userId,
        questionTitle,
        questionDescription
    });

    res.status(201).json({ success: true, data: newQuestion });
});

exports.createAnswer = catchAsyncError(async (req, res) => {
    const { questionId, answer } = req.body;
    const userId = req.user.uid;

    const question = await Question.findById(questionId);
    if (!question) {
        return res.status(404).json({ success: false, message: "Question not found" });
    }

    let isInstructorAnswer = false;
    const course = await DraftedCourse.findById(question.courseId);
    if (course && course.educator.edId.toString() === userId.toString()) {
        isInstructorAnswer = true;
    }

    const newAnswer = await Answer.create({
        questionId,
        answeredBy: userId,
        answer,
        isInstructorAnswer
    });

    question.answerCount += 1;
    await question.save();

    res.status(201).json({ success: true, data: newAnswer });
});

exports.getQuestionsForLecture = catchAsyncError(async (req, res) => {
    const { lectureId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalQuestions = await Question.countDocuments({ lectureId });
    const questions = await Question.find({ lectureId })
        .populate('userId', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({ 
        success: true, 
        data: questions,
        pagination: {
            totalQuestions,
            currentPage: page,
            totalPages: Math.ceil(totalQuestions / limit),
            limit
        }
    });
});

exports.getQuestionsForCourse = catchAsyncError(async (req, res) => {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalQuestions = await Question.countDocuments({ courseId });
    const questions = await Question.find({ courseId })
        .populate('userId', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean to easily attach lectureInfo

    // Attach lecture info by finding the course modules
    const courseModule = await CourseModule.findOne({ courseId });
    if (courseModule) {
        const lectureMap = {};
        courseModule.sectionArr.forEach((section, sIndex) => {
            section.videos.forEach((video, vIndex) => {
                lectureMap[video._id.toString()] = {
                    sectionName: section.sectionName,
                    sectionNo: sIndex + 1,
                    lectureName: video.name,
                    lectureNo: vIndex + 1
                };
            });
        });

        questions.forEach(q => {
            if (q.lectureId && lectureMap[q.lectureId.toString()]) {
                q.lectureInfo = lectureMap[q.lectureId.toString()];
            }
        });
    }

    res.status(200).json({ 
        success: true, 
        data: questions,
        pagination: {
            totalQuestions,
            currentPage: page,
            totalPages: Math.ceil(totalQuestions / limit),
            limit
        }
    });
});

exports.getQuestionDetails = catchAsyncError(async (req, res) => {
    const { questionId } = req.params;
    const question = await Question.findById(questionId)
        .populate('userId', 'username profileImage');
    
    if (!question) {
        return res.status(404).json({ success: false, message: "Question not found" });
    }
    
    const answers = await Answer.find({ questionId })
        .populate('answeredBy', 'username profileImage')
        .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: { question, answers } });
});

exports.getTeacherCoursesWithQuestions = catchAsyncError(async (req, res) => {
    const userId = req.user.uid;

    const courses = await DraftedCourse.find({ "educator.edId": userId }).select('_id title coursePoster totalStudentsPurchased');
    
    const courseIds = courses.map(c => c._id);
    const questions = await Question.find({ courseId: { $in: courseIds } })
        .populate('userId', 'username profileImage')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { courses, questions } });
});

exports.getTeacherQnaAnalytics = catchAsyncError(async (req, res) => {
    const userId = req.user.uid;
    const courses = await DraftedCourse.find({ "educator.edId": userId });
    const courseIds = courses.map(c => c._id);

    const totalQuestions = await Question.countDocuments({ courseId: { $in: courseIds } });
    
    const questionDocs = await Question.find({ courseId: { $in: courseIds } }).distinct('_id');
    const repliedByInstructor = await Answer.countDocuments({ 
        questionId: { $in: questionDocs },
        isInstructorAnswer: true 
    });

    const pendingQuestions = totalQuestions - repliedByInstructor;

    res.status(200).json({ success: true, data: { totalQuestions, repliedByInstructor, pendingQuestions } });
});
