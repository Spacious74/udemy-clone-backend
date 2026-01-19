const express = require("express");
const router = express.Router();
const controller = require('../controllers/review.controller');

router.get('/getReviews', controller.getReviews );
router.post('/addReview', controller.rateAndReview);
router.put('/updateReview', controller.updateReview);
router.delete('/deleteReview', controller.deleteReview);


module.exports = router