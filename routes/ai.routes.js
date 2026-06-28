const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { optionalVerifyToken } = require('../middlewares/optionalAuth');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/chat', optionalVerifyToken, aiController.chat);
router.get('/course-chat/:courseId', verifyToken, aiController.getCourseChat);
router.get('/limit', optionalVerifyToken, aiController.getDailyLimit);

module.exports = router;
