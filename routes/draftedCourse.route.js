const express = require("express");
const draftedCourseRouter = express.Router();
const controller = require('../controllers/drafterCourse.controller');

draftedCourseRouter.get('/', controller.getAllCoursesByEdId);
draftedCourseRouter.get('/getAllCourses', controller.getAllCourses);
draftedCourseRouter.get('/getCourseDetailsById', controller.getCourseDetails);
draftedCourseRouter.get('/courseById', controller.getOneCourseById);
draftedCourseRouter.get('/getByCourseAndEducatorId', controller.getCourseByEdIdAndCourseId);


draftedCourseRouter.post('/create', controller.createCourse);
draftedCourseRouter.post('/update', controller.updateCourse);
draftedCourseRouter.post('/upload-thumbnail', controller.uploadThumbnail);
draftedCourseRouter.post('/release-course', controller.releaseCourse);

draftedCourseRouter.delete('/remove-thumbnail', controller.deleteUploadedImage);



module.exports = draftedCourseRouter;