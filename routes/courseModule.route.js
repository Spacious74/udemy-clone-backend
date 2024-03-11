const express = require("express");
const moduleRouter = express.Router();
const controller = require("../controllers/courseModules.controller");

moduleRouter.get("/:courseId", controller.getAllSections);
moduleRouter.post("/add/:couresId", controller.addSection);
moduleRouter.delete("/delete", controller.deleteSection);
moduleRouter.put("/update", controller.updateSection);


moduleRouter.post('/addvideo', controller.addVideoToSection);
moduleRouter.delete('/deletevideo', controller.deleteVideo);
moduleRouter.put('/videoUpdate', controller.updateVideoTitle);


module.exports = moduleRouter