const User = require("../model/user")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError"); // Adjust path based on your project
const mongoose =require("mongoose")
const cloudinary = require("../config/cloudineryCofig");
const Host = require("../model/host");
const  Review  = require("../model/review");

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
user.lastLogin=Date.now()
    await user.save()           
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
          
     
    


exports.addDetails = async (req, res) => {

 
  try {
    const userId = req.params.id;

    const updateData = {
      ...req.body,
      role: "volunteer", // 👈 force role to volunteer
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    console.log('uuuuuuupdated User');
    res.status(200).json({
      success:true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.loadVolenteer=async(req,res,next)=>{

  const userId = new mongoose.Types.ObjectId(req.user._id);

  const user =await User.findById(userId)
  
  res.status(200).json({success:true, user})
}


exports.updateProfile = async (req, res) => {
    console.log("llllllllog",req.file);
    
    try {
      let uploadedImage = ""; 
  
      if (req.file) {
        console.log("uploadig");
        
        const result = await cloudinary.uploader.upload(req.file.path);
        uploadedImage = result.secure_url; // Store Cloudinary URL
      }
      
  console.log("uploaded image",uploadedImage);
  
    
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id, 
        {profileImage: uploadedImage },
        { new: true, runValidators: true } 
      );
  console.log("updatted",updatedUser);
  
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



  
  exports.getUsers = async (req, res) => {
    try {
      const users = await User.find({}, ' _id firstName  lastName email profileImage role');
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


 exports.updateDetails = async (req, res) => {
    try {
      console.log("updating");
      
      const userId = req.user.id; 
      const updateData = req.body;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true } 
      );
  console.log("upddated");
  
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  exports.addReview = async (req, res) => {
    try {
      const { rating, comment, hostId } = req.body;
  
      const reviewerName = req.user.firstName;
      const reviewerProfile = req.user.profileImage;
      const reviewerId = req.user.id;
  
      // Validate host
      const host = await Host.findById(hostId);
      if (!host) {
        return res.status(404).json({ message: 'Host not found!' });
      }
  
      // Create and save review
      const newReview = new Review({
        rating,
        comment,
        reviewerName,
        reviewerProfile,
        reviewerId,
        host: hostId,
      });
      await newReview.save();
  
      // Push review to host
      host.reviews.push(newReview._id);
      await host.save();
  
      // Optional: Add review reference to User if needed
      await User.findByIdAndUpdate(reviewerId, {
        $push: { reviews: newReview._id },
      });
  
      res.status(200).json({ message: 'Review added successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  exports.getUserReviews = async (req, res) => {
    try {
      const userId = req.user.id; 
  
      // Fetch user with populated reviews
      const user = await User.findById(userId).populate({
        path: 'reviews',
        populate: { path: 'host', select: 'name location' } // Optional: populate host info in each review
      });
  console.log("rrrrrrrrreviews",user);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        reviews: user.reviews,
      });
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
    
  exports.logoutUser=(req, res) => {
    res.clearCookie('userToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use true in production
      sameSite: 'strict',
    });
  
    res.status(200).json({success:true,  message: 'Logged out successfully' });
  }