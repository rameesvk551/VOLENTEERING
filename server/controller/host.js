const Host = require("../model/host")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError")
const axios=require("axios")
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


 exports.addDetails = async (req, res, next) => {
  try {
    console.log("hhhhcccccccccchhost details");
    
    const {
      email,
      address,
      description,
      selectedHelpTypes,
      allowed,
      accepted,
      languageDescription,
      languageAndLevel,
      showIntreastInLanguageExchange,
      privateComment,
      organisation,
    } = req.body;
 console.log(req.body);
 
    let host = await Host.findOne({ email });

    if (host) {
      host.address = address;
      host.description = description;
      host.selectedHelpTypes = selectedHelpTypes;
      host.allowed = allowed;
      host.accepted = accepted;
      host.languageDescription = languageDescription;
      host.languageAndLevel = languageAndLevel;
      host.showIntreastInLanguageExchange = showIntreastInLanguageExchange;
      host.privateComment = privateComment;
      host.organisation = organisation;
console.log("hhhhhhhhhost ",host);

      await host.save(); 
      return res.status(200).json({ message: "Host details updated successfully", host });
    } else {
    }
  } catch (error) {
    console.log(error);
    
    next(error)
      }
};

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


// Route to fetch places
 exports.fetchAddressPlaces=async (req, res) => {
    const { input } = req.query;

    if (!input) {
        return res.status(400).json({ error: "Input query is required" });
    }

    try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
              q:input,
              format: "json",
              countrycodes: "IN",
            },
          });
          console.log(response.data);
          
          ;

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching places:", error);
        res.status(500).json({ error: "Failed to fetch places" });
    }
}



