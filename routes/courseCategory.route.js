const express = require('express');
const categoryRouter = express.Router();
const controller = require("../controllers/courseCategory.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authorizeRoles.middleware");

// Public route to fetch categories for navbar and course creation dropdown
categoryRouter.get('/getAll', controller.getAllCategories);
categoryRouter.get('/parents', controller.getAllParentCategories);
categoryRouter.get('/sub/:parentId', controller.getSubCategoriesByParentId);

// Admin only route to add a new category
categoryRouter.post('/add', verifyToken, authorizeRoles('admin'), controller.addCategory);
categoryRouter.put('/update/:id', verifyToken, authorizeRoles('admin'), controller.updateCategory);
categoryRouter.delete('/delete/:id', verifyToken, authorizeRoles('admin'), controller.deleteCategory);

module.exports = categoryRouter;
