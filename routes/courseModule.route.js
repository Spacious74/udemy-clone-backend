const express = require("express");
const moduleRouter = express.Router();
const controller = require("../controllers/courseModules.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authorizeRoles.middleware");

moduleRouter.get("/getAllSections", verifyToken, controller.getAllSections);
moduleRouter.get('/getVideoFile', verifyToken, controller.getVideoFile);

moduleRouter.post("/add", verifyToken, authorizeRoles("educator", "admin"), controller.addSection);
moduleRouter.post('/addVideo', verifyToken, authorizeRoles("educator", "admin"), controller.addVideoToSection);

moduleRouter.put("/update", verifyToken, authorizeRoles("educator", "admin"), controller.updateSection);
moduleRouter.put('/updateVideoTitle', verifyToken, authorizeRoles("educator", "admin"), controller.updateVideoTitle);
moduleRouter.put('/updateVideoFile', verifyToken, authorizeRoles("educator", "admin"), controller.updateVideoFile);
moduleRouter.put('/addVideoFile', verifyToken, authorizeRoles("educator", "admin"), controller.addVideoFile);

moduleRouter.delete("/delete", verifyToken, authorizeRoles("educator", "admin"), controller.deleteSection);
moduleRouter.delete('/deletevideo', verifyToken, authorizeRoles("educator", "admin"), controller.deleteVideo);

module.exports = moduleRouter