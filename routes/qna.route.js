const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles.middleware');
const {
    createQuestion,
    createAnswer,
    getQuestionsForLecture,
    getQuestionDetails,
    getTeacherCoursesWithQuestions,
    getTeacherQnaAnalytics,
    getQuestionsForCourse
} = require('../controllers/qna.controller');

// Student routes
router.post('/question', verifyToken, createQuestion);
router.post('/answer', verifyToken, createAnswer);
router.get('/questions/:lectureId', verifyToken, getQuestionsForLecture);
router.get('/questions/course/:courseId', verifyToken, getQuestionsForCourse);
router.get('/question/:questionId', verifyToken, getQuestionDetails);

// Teacher routes
router.get('/teacher/courses', verifyToken, authorizeRoles('teacher'), getTeacherCoursesWithQuestions);
router.get('/teacher/analytics', verifyToken, authorizeRoles('teacher'), getTeacherQnaAnalytics);

module.exports = router;
