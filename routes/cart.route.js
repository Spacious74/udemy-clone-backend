const express = require('express');
const router = express.Router();
const controller = require('../controllers/cart.controller');
const {verifyToken} = require('../middlewares/authMiddleware');

router.get('/getCart', verifyToken, controller.getCart);
router.post('/addToCart', verifyToken, controller.addToCart);
router.post('/mergeCart', verifyToken ,controller.mergeCart);
router.post('/removeFromCart', verifyToken, controller.removeFromCart);

module.exports = router;