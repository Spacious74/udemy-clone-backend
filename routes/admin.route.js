const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles.middleware');
const adminController = require('../controllers/admin.controller');

// All admin routes must be protected
router.use(verifyToken, authorizeRoles('admin'));

// Dashboard Stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);

// Courses
router.get('/courses', adminController.getCourses);
router.delete('/courses/:id', adminController.deleteCourse);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.addCategory);
router.put('/categories/:id', adminController.editCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Transactions
router.get('/transactions', adminController.getTransactions);

module.exports = router;
