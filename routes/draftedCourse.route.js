const express = require("express");
const draftedCourseRouter = express.Router();
const controller = require('../controllers/drafterCourse.controller');

// Get Instructor created courses
draftedCourseRouter.get('/', controller.getAllCoursesByEdId);

// Get Instructor released courses
draftedCourseRouter.get('/released', controller.getReleaseCourseByEdId);

draftedCourseRouter.get('/getAllCourses', controller.getAllCourses);
draftedCourseRouter.get('/getCourseDetailsById', controller.getCourseDetails);
draftedCourseRouter.get('/courseById', controller.getOneCourseById);
draftedCourseRouter.get('/getByCourseAndEducatorId', controller.getCourseByEdIdAndCourseId);
draftedCourseRouter.get('/getCourseAndPlaylist', controller.getCourseAndPlaylist);

draftedCourseRouter.post('/create', controller.createCourse);
draftedCourseRouter.post('/update', controller.updateCourse);
draftedCourseRouter.post('/upload-thumbnail', controller.uploadThumbnail);
draftedCourseRouter.post('/release-course', controller.releaseCourse);

draftedCourseRouter.delete('/remove-thumbnail', controller.deleteUploadedImage);
draftedCourseRouter.delete('/delete-course', controller.deleteCourse);

module.exports = draftedCourseRouter;