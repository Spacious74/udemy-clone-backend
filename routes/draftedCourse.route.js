const express = require("express");
const draftedCourseRouter = express.Router();
const controller = require('../controllers/drafterCourse.controller');

draftedCourseRouter.get('/', controller.getAllCoursesByEdId);
draftedCourseRouter.get('/courseById', controller.getOneCourseById);
draftedCourseRouter.get('/getByCourseAndEducatorId', controller.getCourseByEdIdAndCourseId);


draftedCourseRouter.post('/create', controller.createCourse);
draftedCourseRouter.post('/update', controller.updateCourse);
draftedCourseRouter.post('/upload-thumbnail', controller.uploadThumbnail);

draftedCourseRouter.delete('/remove-thumbnail', controller.deleteUploadedImage);



module.exports = draftedCourseRouter;