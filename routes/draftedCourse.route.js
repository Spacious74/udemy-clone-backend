const express = require("express");
const draftedCourseRouter = express.Router();
const controller = require('../controllers/drafterCourse.controller');
const {verifyToken} = require('../middlewares/authMiddleware');
const {authorizeRoles} = require('../middlewares/authorizeRoles.middleware');

// Get Instructor created courses
draftedCourseRouter.get('/', verifyToken, authorizeRoles('teacher', 'admin'), controller.getAllCoursesByEdId);

// Get Instructor released courses
draftedCourseRouter.get('/released', verifyToken, authorizeRoles('teacher', 'admin'), controller.getReleaseCourseByEdId);

draftedCourseRouter.get('/getAllCourses', controller.getAllCourses);
draftedCourseRouter.get('/search/suggestions', controller.getSearchSuggestions);
draftedCourseRouter.get('/getCourseDetailsById', controller.getCourseDetails);
draftedCourseRouter.get('/courseById', controller.getOneCourseById);
draftedCourseRouter.get('/getCourseAndPlaylist', controller.getCourseAndPlaylist);

draftedCourseRouter.get('/getByCourseAndEducatorId', verifyToken, authorizeRoles('teacher', 'admin'), controller.getCourseByEdIdAndCourseId);
draftedCourseRouter.get('/enrolled-students', verifyToken, authorizeRoles('teacher', 'admin'), controller.getEnrolledStudents);
draftedCourseRouter.post('/create', verifyToken, authorizeRoles('teacher', 'admin'), controller.createCourse);
draftedCourseRouter.post('/update', verifyToken, authorizeRoles('teacher', 'admin'), controller.updateCourse);
draftedCourseRouter.post('/upload-thumbnail', verifyToken, authorizeRoles('teacher', 'admin'), controller.uploadThumbnail);
draftedCourseRouter.post('/release-course', verifyToken, authorizeRoles('teacher', 'admin'), controller.releaseCourse);

draftedCourseRouter.delete('/remove-thumbnail', verifyToken, authorizeRoles('teacher', 'admin'), controller.deleteUploadedImage);
draftedCourseRouter.delete('/delete-course', verifyToken, authorizeRoles('teacher', 'admin'), controller.deleteCourse);

module.exports = draftedCourseRouter;