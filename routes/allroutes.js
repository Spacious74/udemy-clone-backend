const express = require("express");
const allRoutes = express.Router();

// Importing all individual routes
const courseRouter = require('./course.route')
const userRouter = require("./user.route")

// Using all imported routes through a single route called allRoutes and exporting it to index.js
allRoutes.use('/skillup/api/v1/course',courseRouter)
allRoutes.use("/skillup/api/v1/user",userRouter)

// Base API route
allRoutes.use("skillup/api/v1", (req,res)=>{
    res.status(200).send({
        message : "Hello this is the home page"
    })
})

module.exports = allRoutes