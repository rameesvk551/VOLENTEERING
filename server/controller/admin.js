

const User = require("../model/user")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError"); 
exports.adminLogin = async(req,res,next)=>{
    try {
        const {email,password}=req.body
        const admin=await User.findOne({email:email}).select('+password')
        console.log("uuuuser founded",admin);
        
    if (!admin) return next(new CustomError("Acces denied", 404));
    if (admin.role !== "admin") return next(new CustomError("you are not admin", 401));
  const isPasswordMatch=await bcrypt.compare(password,admin.password)
  if (!isPasswordMatch) return next(new CustomError("Incorrect password", 401));
    
               
          const token=  jwt.sign({_id:admin._id,email:admin.email},process.env.JWT_SECRET,{expiresIn:"7d"})

            res.cookie("adminToken",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict"
            }).status(200)
            .json({success:true,admin:{
                _id:admin._id,
                firsrName:admin.firstName,
                lastName:admin.lastName,
                email:admin.email,
               
            }})
     
    } catch (error) {
        next(error); 
    }
}

exports.loadAdmin=async(req,res,next)=>{
    try {
        console.log("admin idd",req.admin._id);

    const admin=await User.findById(req.admin.id)
    console.log("admin finded",admin);
    
    res.json({success:true, admin})
    } catch (error) {
       (next) 
    }

}

exports.getAllVolenteers=async(req,res,next)=>{
try {
    
    const volunteers = await User.find()

    
    return res.json({success:true,volunteers})
} catch (error) {
    next(error)
}
}


exports.blockUser = async (req,res,next) => {
    try {
        const volunteer = await User.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (volunteer.status === "blocked") {
            return res.status(400).json({ success: false, message: "User is already blocked" });
        }

        volunteer.status = "blocked";
        await volunteer.save();

        return res.json({ success: true, message: "User blocked successfully" });
    } catch (error) {
        return next(error);
    }
};