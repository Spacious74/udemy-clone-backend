const express = require("express");
const router = express.Router();
const controller = require("../controllers/educator.controller");

router.get("/", controller.getAllEducator)
router.post("/create", controller.createEducator);

module.exports = router;