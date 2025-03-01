const express = require("express");
const moduleRouter = express.Router();
const controller = require("../controllers/courseModules.controller");

moduleRouter.get("/getAllSections", controller.getAllSections);

moduleRouter.post("/add", controller.addSection);
moduleRouter.post('/addVideo', controller.addVideoToSection);

moduleRouter.put("/update", controller.updateSection);
moduleRouter.put('/updateVideoTitle', controller.updateVideoTitle);
moduleRouter.put('/updateVideoFile', controller.updateVideoFile);
moduleRouter.put('/addVideoFile', controller.addVideoFile);

moduleRouter.delete("/delete", controller.deleteSection);
moduleRouter.delete('/deletevideo', controller.deleteVideo);



module.exports = moduleRouter