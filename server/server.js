require("dotenv").config()
const express =require("express")
const app=express()
const cors=require("cors")
const cookieParser = require("cookie-parser");
const userRoutes=require("./routes/user")
const hostRoutes=require("./routes/host");
const blogRoutes=require("./routes/blog");
const paymentRoutes=require("./routes/payment");
const adminRoutes=require("./routes/admin")
const publicRoutes=require("./routes/public")
const errorHandler = require("./middleware/errorHandler");
const dbConnect = require("./config/db");

//middlewares
app.use(cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true
}));

app.use(express.json());//for parsing json paylload
app.use(express.urlencoded({ extended: true }));//for parsing url encoded payload
app.use(cookieParser());
//routes
app.use("/api/v1",publicRoutes)
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/host",hostRoutes)
app.use("/api/v1/admin",adminRoutes)
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/host",hostRoutes)
app.use("/api/v1/blog",blogRoutes)
app.use("/api/v1/payment",paymentRoutes)

app.use(errorHandler);
dbConnect()

const PORT=process.env.PORT || 9999
app.listen(PORT,()=>{
    console.log(`${PORT} app is running`);
    
})