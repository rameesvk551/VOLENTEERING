require("dotenv").config()
const express =require("express")
const app=express()
const cors=require("cors")
const cookieParser = require("cookie-parser");
const userRoutes=require("./routes/user")
const hostRoutes=require("./routes/host");
const errorHandler = require("./middleware/errorHandler");
const dbConnect = require("./config/db");

//middlewares
app.use(cors())
app.use(express.json());//for parsing json paylload
app.use(express.urlencoded({ extended: true }));//for parsing url encoded payload
app.use(cookieParser());
//routes
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/host",hostRoutes)

app.use(errorHandler);
dbConnect()

const PORT=process.env.PORT || 9999
app.listen(PORT,()=>{
    console.log(`${PORT} app is running`);
    
})