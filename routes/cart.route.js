const express = require('express');
const router = express.Router();
const controller = require('../controllers/cart.controller');
const {verifyToken} = require('../middlewares/authMiddleware')

router.get('/get/:userId', verifyToken, controller.getCart);

router.post('/addToCart', controller.addToCart);

router.post('/removeFromCart', controller.removeFromCart);

module.exports = router;