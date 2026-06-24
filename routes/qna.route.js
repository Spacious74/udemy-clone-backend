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
    getTeacherQnaAnalytics
} = require('../controllers/qna.controller');

// Student routes
router.post('/question', verifyToken, createQuestion);
router.post('/answer', verifyToken, createAnswer);
router.get('/questions/:lectureId', verifyToken, getQuestionsForLecture);
router.get('/question/:questionId', verifyToken, getQuestionDetails);

// Teacher routes
router.get('/teacher/courses', verifyToken, authorizeRoles('educator'), getTeacherCoursesWithQuestions);
router.get('/teacher/analytics', verifyToken, authorizeRoles('educator'), getTeacherQnaAnalytics);

module.exports = router;
