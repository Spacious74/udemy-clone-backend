const express = require("express");
const allRoutes = express.Router();

// Importing all individual routes
const courseRouter = require('./course.route')
const moduleRouter = require("./courseModule.route")
const userRouter = require("./user.route")
const educatorRouter = require("./educator.route");
const cartRouter = require("./cart.route");
const purchaseRouter = require("./purchase.route");
const reviewRouter = require('./review.route');
const qaRouter = require('./qa.route');

// Using all imported routes through a single route called allRoutes and exporting it to index.js
allRoutes.use('/skillup/api/v1/course',courseRouter)
allRoutes.use("/skillup/api/v1/module",moduleRouter);
allRoutes.use("/skillup/api/v1/user",userRouter)
allRoutes.use("/skillup/api/v1/educator", educatorRouter)
allRoutes.use("/skillup/api/v1/cart", cartRouter),
allRoutes.use('/skillup/api/v1/buy', purchaseRouter),
allRoutes.use('/skillup/api/v1/review', reviewRouter)
allRoutes.use('/skillup/api/v1/qa', qaRouter);


// Base API route
allRoutes.use("skillup/api/v1", (req,res)=>{
    res.status(200).send({
        message : "Hello this is the home page"
    })
})

module.exports = allRoutes