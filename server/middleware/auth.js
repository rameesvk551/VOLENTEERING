
const User = require("../model/user")
const Host = require("../model/host")
const jwt=require("jsonwebtoken")
const CustomError = require("../utils/customError")


exports.isAuthenticated=async(req,res,next)=>{
    const {userToken}=req.cookies
    console.log("userToken in cookies",req.cookies);
    
    if(!userToken) return next(new CustomError("no jwt token provided",400))

        const decoded=jwt.verify(userToken,process.env.JWT_SECRET)
      
        req.user=await User.findById(decoded._id)
        if (!req.user) {
            return next(new CustomError("User not found", 404));
        }
     
         return next()
}

exports.isHost = async (req, res, next) => {
    try {
        const { hostToken } = req.cookies;
        console.log("userToken in cookies", hostToken);

        if (!hostToken) return next(new CustomError("No JWT token provided", 400));

        const decoded = jwt.verify(hostToken, process.env.JWT_SECRET);
        console.log("Decoded JWT:", decoded); 

       
        req.hostUser = await Host.findById(decoded._id);
        console.log("Host from DB:", req.hostUser);

        if (!req.hostUser) return next(new CustomError("Host not found", 404));

        next();
    } catch (error) {
        next(new CustomError("Invalid or expired token", 401));
    }
};



exports. isAdmin = async (req, res, next) => {
    try {
        const { adminToken } = req.cookies;
        if (!adminToken) {
            return next(new CustomError("No JWT token provided", 401));
        }

      
       
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        console.log("admin tolen",decoded);
      
        req.admin = await User.findById(decoded._id); 
        console.log("aaaaaaadmin",req.admin);
        
        if (!req.admin || req.admin.role !== "admin") {
            return next(new CustomError("Access denied. Admin only.", 403));
        }
console.log("nnnnnext");

        next();
    } catch (error) {
        return next(new CustomError("Invalid token or session expired", 403));
    }
};

