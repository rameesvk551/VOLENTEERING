
const User = require("../model/user")
const Host = require("../model/host")
const jwt=require("jsonwebtoken")
const CustomError = require("../utils/customError")


exports.isAuthenticated=async(req,res,next)=>{
    const {userToken}=req.cookies
    console.log("userToken in cookies",userToken);
    
    if(!userToken) return next(new CustomError("no jwt token provided",400))

        const decoded=jwt.verify(userToken,process.env.JWT_SECRET)
        req.user=await User.findById(decoded._id)
}

exports.isHost=async(req,res,next)=>{
    const {hostToken}=req.cookies
    console.log("userToken in cookies",hostToken);
    
    if(!hostToken) return next(new CustomError("no jwt token provided",400))

        const decoded=jwt.verify(userToken,process.env.JWT_SECRET)
        req.host=await Host.findById(decoded._id)
}