const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.controller');
const {verifyToken} = require('../middlewares/authMiddleware');

// router.post('/checkout');

module.exports = router;