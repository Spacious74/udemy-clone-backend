const express = require('express');
const categoryRouter = express.Router();
const controller = require("../controllers/courseCategory.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authorizeRoles.middleware");

// Public route to fetch categories for navbar and course creation dropdown
categoryRouter.get('/getAll', controller.getAllCategories);

// Admin only route to add a new category
categoryRouter.post('/add', verifyToken, authorizeRoles('admin'), controller.addCategory);

module.exports = categoryRouter;
