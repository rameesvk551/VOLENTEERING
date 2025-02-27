const User = require("../model/user")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError"); // Adjust path based on your project


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





