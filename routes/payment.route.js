const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.controller');
const {verifyToken} = require('../middlewares/authMiddleware');

router.post('/single-checkout-order', verifyToken, controller.singleCheckoutOrder);
router.post('/cart-checkout-order', verifyToken, controller.multipleOrderCheckout);

router.post('/single-payment-verification', verifyToken, controller.singlePaymentVerification);
router.post('/cart-payment-verification', verifyToken, controller.cartPaymentVerification);

module.exports = router;