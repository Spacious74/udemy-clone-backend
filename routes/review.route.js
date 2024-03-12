const express = require("express");
const router = express.Router();
const controller = require('../controllers/review.controller');

router.get('/:courseId', controller.getReviews );
router.post('/add', controller.rateAndReview);
router.put('/edit', controller.updateReview);
router.delete('/delete', controller.deleteReview);


module.exports = router