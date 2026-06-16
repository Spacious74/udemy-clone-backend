const express = require('express');
const router = express.Router();
const { getEarningsAndReports } = require('../controllers/earnings.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

// Apply verifyToken middleware since this is for educators
router.get('/', verifyToken, getEarningsAndReports);

module.exports = router;
