// server connection and Database connection file.

const express = require("express");
const dotenv = require("dotenv");

// importing Mongoose ORM library to query the database
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();


// Using bodyparser.json to make sure that while submitting form then data send and recieve in json format
app.use(bodyParser.json());


// Configuring paths for global level constants variables using dotenv library
dotenv.config({path : "./config/config.env"})


// Creating connection to database to mongoDB Atlas and exporting the method.
const dbconnection = async()=>{
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("Database connection established");
    } catch (err) {
        console.log("Error in connecting db : " + err);
    }
}

// exporting app and dbconnection 
module.exports = {app, dbconnection}