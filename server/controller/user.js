const User = require("../model/user")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError"); // Adjust path based on your project
const mongoose =require("mongoose")
const cloudinary = require("../config/cloudineryCofig");

exports.userSignup= async(req,res,next)=>{
   
    
    const {firstName,lastName,email,password}=req.body
try {
    const  existingUser=await User.findOne({email:email})
    if(existingUser) return next( new CustomError("account already exist",400))
        console.log("hashing password");
const hashedPassword=await bcrypt.hash(password,10)
    console.log("no user exist saving");
    
        const user=new User({
            firstName,
        lastName,
        email,
        password :hashedPassword 
        })
    await user.save()

  if (!process.env.JWT_SECRET) {
    return next(new CustomError("JWT_SECRET is not set", 500));
}
    const token=  jwt.sign({_id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:"7d"})

    res.cookie("userToken",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict"
    }).status(200)
    .json({success:true,user:{
        _id:user._id,
        firsrName:user.firstName,
        lastName:user.lastName,
        email:user.email,
    }})

        
} catch (error) {
    next(error)
}
   
}



           
exports.userLogin = async(req,res,next)=>{
    try {
        const {email,password}=req.body
        const user=await User.findOne({email:email}).select('+password')
        console.log("uuuuser founded",user);
        
    if (!user) return next(new CustomError("User does not exist", 404));
  const isPasswordMatch=await bcrypt.compare(password,user.password)
  if (!isPasswordMatch) return next(new CustomError("Incorrect password", 401));

               
          const token=  jwt.sign({_id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:"7d"})

          res.cookie("userToken",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict"
        }).status(200)
            .json({success:true,user:{
                _id:user._id,
                firsrName:user.firstName,
                lastName:user.lastName,
                email:user.email,
            }})
     
    } catch (error) {
        next(error); 
    }
}
          
     
    


exports.addDetails = async (req, res, next) => {
    console.log("Received Request Data:", req.body);
    const userId = req.params.id;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { $set: req.body },
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success:true, message: "User details updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.loadVolenteer=async(req,res,next)=>{
  console.log("iiiiiiiiiid",req.user._id);
  const userId = new mongoose.Types.ObjectId(req.user._id);


  
  const user =await User.findById(userId)
  console.log("hhhhhost",user);
  
  res.status(200).json({success:true, user})
}


exports.updateProfile = async (req, res) => {
    console.log("llllllllog",req.file);
    
    try {
      let uploadedImage = ""; 
  
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        uploadedImage = result.secure_url; // Store Cloudinary URL
      }
      
  
    
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id, 
        {profileImage: uploadedImage },
        { new: true, runValidators: true } 
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
  
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };