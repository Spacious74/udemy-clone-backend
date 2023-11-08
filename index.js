const {app, dbconnection} = require("./connections");
const PORT = process.env.PORT || 8080;
// connecting database to Mongo Atlas
dbconnection();

// importing all routes
const allRoutes = require("./routes/allroutes")
app.use(allRoutes);


// Running server using listen method
app.listen(PORT, ()=>{
    console.log("Server is listening on port : " + PORT);
});
