const Host = require("../model/host")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError")

exports.hostSignup= async(req,res,next)=>{
    console.log("host hitting");
    
    const {firstName,lastName,email,password}=req.body
try {
    const  existingHost=await Host.findOne({email:email})
    console.log("existinggg",existingHost);
    
    if(existingHost) return next(new CustomError("account already exist",400));
const hashedPassword=await bcrypt.hash(password,10)
        const newHost=new Host({
            firstName,
        lastName,
        email,
        password :hashedPassword 
        })

    await newHost.save()

    const host = newHost.toObject();
    delete host.password;


  if (!process.env.JWT_SECRET) {
    return next(new CustomError("JWT_SECRET is not set", 500));
}
    const token=  jwt.sign({_id:host._id,email:host.email},process.env.JWT_SECRET,{expiresIn:"7d"})

    res.cookie("hostToken",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict"
    }).status(200)
    .json({success:true,
        host
    })

        
} catch (error) {
    next(error)
}
   
}

exports.hostLogin=async(req,res,next)=>{
    try {
        console.log("eeethiiiii");
        
        const {email,password}=req.body
        const host=await Host.findOne({email:email}).select("+password")
        if(!host)return next(new CustomError("user does not exist", 404));
  const isPasswordMatch=await bcrypt.compare(password,host.password)
            if(!isPasswordMatch)  return next(new CustomError("Password not matching", 401));

                //generating jwt token 
          const token=  jwt.sign({_id:host._id,email:host.email},process.env.JWT_SECRET,{expiresIn:"7d"})

            res.cookie("hostToken",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict"
            }).status(200)
            .json({success:true,    
                  host: {
                _id: host._id,
                name: host.name,
                email: host.email,
                role: host.role, // Do not send password
            },
            token,})
     
    } catch (error) {
        next(error); 
    }
}





