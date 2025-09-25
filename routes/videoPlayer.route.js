const express = require("express");
const videoPlayerRoute = express.Router();
const controller = require('../controllers/videoPlayer.controller');

videoPlayerRoute.get('/getOneVideo', controller.getOneVideoById);

module.exports = videoPlayerRoute