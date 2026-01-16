const express = require("express");
const path = require("path");
const {app, dbconnection} = require("./connections");
const PORT = process.env.PORT || 8080;
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');;
const cors = require("cors");

// connecting database to Mongo Atlas
dbconnection();

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET_KEY 
});

// Enable files upload
app.use(fileUpload({
    useTempFiles: false, 
}));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials : true
}));

// importing all routes
const allRoutes = require("./routes/allroutes")

app.use(
  "/certificates",
  express.static(path.join(process.cwd(), "public", "certificates"))
);

app.use(allRoutes);


// Running server using listen method
app.listen(PORT, ()=>{
    console.log("Server is listening on port : " + PORT);
});