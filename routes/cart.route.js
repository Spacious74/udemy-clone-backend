const express = require('express');
const router = express.Router();
const controller = require('../controllers/cart.controller');
const {verifyToken} = require('../middlewares/authMiddleware')

router.post('/add', controller.addToCart);
router.post('/delete', controller.removeFromCart);
router.get('/get/:userId', verifyToken, controller.getCart);

module.exports = router;