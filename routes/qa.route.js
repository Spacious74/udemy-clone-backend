const express = require('express');
const router = express.Router();
const controller = require('../controllers/qa.controller');

router.get('/getque/:courseId', controller.getQuestions);
router.post('/ask', controller.askQuestion);
router.put('/edtique', controller.editQuestion);
router.delete('/deleteQue', controller.deleteQuestion);

router.get('/getAns', controller.getAnswersOfQuestion);
router.post('/answer', controller.replyAnswer);
router.put("/editAns", controller.editAnswer);
router.delete('/deleteAns', controller.deleteAnswer);

module.exports = router;