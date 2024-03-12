const express = require('express');
const router = express.Router();
const controller = require('../controllers/puchase.controller')
const {verifyToken} = require('../middlewares/authMiddleware')

// here you have to include middleware for checking payment successfull or not

router.post('/save', verifyToken, controller.buyNow);


module.exports = router;