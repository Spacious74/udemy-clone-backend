const express = require('express');
const progressRouter = express.Router();
const controller = require('../controllers/userProgress.controller');

progressRouter.get('/', controller.getUserProgress);

progressRouter.post('/update', controller.updateProgress);

progressRouter.post('/add', controller.createUserProgress);

module.exports = progressRouter;