const express = require("express");
const allRoutes = express.Router();

// Importing all individual routes
const moduleRouter = require("./courseModule.route")
const userRouter = require("./user.route")
const cartRouter = require("./cart.route");
const reviewRouter = require('./review.route');
const draftedCourseRouter = require("./draftedCourse.route");
const paymentRouter = require("./payment.route");
const progressRouter = require('./userProgress.route');
const certificateRouter = require('./certificate.route');
const categoryRouter = require('./courseCategory.route');
const courseAnalyticsRouter = require('./courseAnalytics.route');
const earningsRouter = require('./earnings.route');
const aiRouter = require('./ai.routes');


// Using all imported routes through a single route called allRoutes and exporting it to index.js
allRoutes.use('/skillup/api/v1/draftedCourse',draftedCourseRouter)
allRoutes.use("/skillup/api/v1/videoModule",moduleRouter);
allRoutes.use("/skillup/api/v1/user",userRouter)
allRoutes.use("/skillup/api/v1/cart", cartRouter),
allRoutes.use('/skillup/api/v1/review', reviewRouter)
allRoutes.use('/skillup/api/v1/payment', paymentRouter);
allRoutes.use('/skillup/api/v1/user-progress', progressRouter);
allRoutes.use('/skillup/api/v1/certificate', certificateRouter);
allRoutes.use('/skillup/api/v1/category', categoryRouter);
allRoutes.use('/skillup/api/v1/analytics', courseAnalyticsRouter);
allRoutes.use('/skillup/api/v1/earnings', earningsRouter);
allRoutes.use('/skillup/api/v1/ai', aiRouter);


// Base API route
allRoutes.use("/skillup/api/v1", (req,res)=>{
    res.status(200).send({
        message : "Hello this is the home page"
    })
});

module.exports = allRoutes