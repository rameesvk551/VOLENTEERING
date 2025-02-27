
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
        if (!req.user) {
            return next(new CustomError("User not found", 404));
        }
     
         return next()
}

exports.isHost=async(req,res,next)=>{
    const {hostToken}=req.cookies
    console.log("userToken in cookies",hostToken);
    
    if(!hostToken) return next(new CustomError("no jwt token provided",400))

        const decoded=jwt.verify(userToken,process.env.JWT_SECRET)
        req.host=await Host.findById(decoded._id)
}



exports. isAdmin = async (req, res, next) => {
    try {
        const { adminToken } = req.cookies;
        console.log("Admin Token in cookies:", adminToken);

        if (!adminToken) {
            return next(new CustomError("No JWT token provided", 401));
        }

        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

      
        req.user = await User.findById(decoded.id); 

        if (!req.user || req.user.role !== "admin") {
            return next(new CustomError("Access denied. Admin only.", 403));
        }

        next();
    } catch (error) {
        return next(new CustomError("Invalid token or session expired", 403));
    }
};

