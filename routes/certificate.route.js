const express = require('express');
const certificateRouter = express.Router();
const controller = require('../controllers/certificate.controller');

certificateRouter.post('/generate', controller.generateCertificate);

module.exports = certificateRouter;