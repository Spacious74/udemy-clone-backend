const express = require("express");
const courseAnalyticsRouter = express.Router();
const controller = require('../controllers/courseAnalytics.controller');
const {verifyToken} = require('../middlewares/authMiddleware');
const {authorizeRoles} = require('../middlewares/authorizeRoles.middleware');

// Get Instructor's analytics
courseAnalyticsRouter.get('/teacher', verifyToken, authorizeRoles('teacher', 'admin'), controller.getTeacherAnalytics);

module.exports = courseAnalyticsRouter;
