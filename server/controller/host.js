const Host = require("../model/host")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError")
const axios=require("axios")
const { default: mongoose } = require("mongoose")
const ApiFeatures = require("../utils/ApiFeatures"); 

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
    console.log("Received host details",req.body);

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
      images, // ✅ Directly use images from request body
    } = req.body;

    console.log("Email:", email);
    console.log("Request Body:", req.body);

    let host = await Host.findOne({ email });

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    // ✅ Use images from req.body instead of req.files
    let uploadedImages = images || []; 

    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(
        req.files.map(async (file, index) => {
          const result = await cloudinary.uploader.upload(file.path);
          return {
            url: result.secure_url,
            description: req.body.imageDescriptions?.[index] || "",
          };
        })
      );
    }

    // ✅ Append images properly
    host.images = [...host.images, ...uploadedImages];

    // ✅ Update other fields
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

   
    host = await host.save();
    console.log("Updated host images:", host.images);

    return res.status(200).json({ message: "Host details updated successfully", host });
  } catch (error) {
    console.error("Error:", error);
    next(error);
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

         
          // Check if the profile is incomplete based on existing host data
    const isProfileIncomplete = !(
        host.address &&
        host.description &&
        host.selectedHelpTypes?.length &&
        host.allowed?.length &&
        host.accepted?.length &&
        host.languageDescription &&
        host.languageAndLevel?.length &&
        host.showIntreastInLanguageExchange &&
        host.privateComment &&
        host.organisation
      );
  
      if (isProfileIncomplete) {
        return res
          .cookie("hostToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          })
          .status(200)
          .json({
            success: true,
            profileNotCompleted: true,
            host,
            token,
          });
      }
else{
    res.cookie("hostToken",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict"
    }).status(200)
    .json({success:true,    
          host: host,
    token,})
}  


            
     
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


// loadhost 

exports.loadHost=async(req,res,next)=>{
  console.log("iiiiiiiiiid",req.hostUser._id);
  const hostId = new mongoose.Types.ObjectId(req.hostUser._id);


  
  const host =await Host.findById(hostId)
  console.log("hhhhhost",host);
  
  res.status(200).json({success:true, host})
}

exports.getHosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // default to page 1, limit 10
    const skip = (page - 1) * limit;

    const apiFeatures = new ApiFeatures(Host.find(), req.query)
      .filter()
      .paginate(limit)
      .sort();

    const hosts = await apiFeatures.query;
    const totalHosts = await Host.countDocuments();
    const totalPages = Math.ceil(totalHosts / limit);

    res.status(200).json({
      hosts,
      currentPage: page,
      totalPages: totalPages,
      totalHosts: totalHosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getHostById = async (req, res) => {
  try {
    const { id } = req.params;
    const host = await Host.findById(id);
console.log("hhhhhhhhot foundd",host);

    if (!host) {
      return res.status(404).json({ success: false, message: "Host not found" });
    }

    res.status(200).json({ success: true, host });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};