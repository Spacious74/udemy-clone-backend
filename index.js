const {app, dbconnection} = require("./connections");
const PORT = process.env.PORT || 8080;
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');
// connecting database to Mongo Atlas
dbconnection();

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET_KEY 
});

app.use(cookieParser());
// importing all routes
const allRoutes = require("./routes/allroutes")
app.use(allRoutes);


// Running server using listen method
app.listen(PORT, ()=>{
    console.log("Server is listening on port : " + PORT);
});

