const Host = require("../model/host")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const CustomError = require("../utils/customError")
const axios=require("axios")
const { default: mongoose } = require("mongoose")

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

  console.log("iiiiiiiiiid",req.hostName);
  const hostId = new mongoose.Types.ObjectId(req.hostName);


  try {
    console.log("Received host details", req.body);

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
      images, // ✅ Use image URLs and descriptions directly from body
    } = req.body;

    // Convert stringified arrays if necessary (in case frontend sends them as strings)
    const parsedImages = typeof images === "string" ? JSON.parse(images) : images;

    let host = await Host.findOne({_id:hostId});
console.log("finded host",host);

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
console.log("pared images",parsedImages);

    // ✅ Directly use images from the request body
    const uploadedImages = parsedImages || [];
console.log("aadingimages");

    // ✅ Append new images to existing ones
    host.images = [...host.images, ...uploadedImages];
console.log("image added");

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

    await host.save();

    console.log("Updated host images:", host.images);

    return res.status(200).json({ message: "Host details updated successfully", host });
  } catch (error) {
    console.error("Error updating host details:", error);
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
        host.languageAndLevel?.length 
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
exports.loadHost=async(req,res,next)=>{
  console.log("iiiiiiiiiid",req.hostName_id);
  const hostId = new mongoose.Types.ObjectId(req.hostName._id);

  const host = await Host.findByIdAndUpdate(
    hostId,
    { lastActive: new Date() },
    { new: true } 
  );
  
  console.log("Updated host:", host);
  

  
  res.status(200).json({success:true, host})
}
exports.getHosts = async (req, res) =>  {
  try {
    const {
      hostTypes = '',
      hostWelcomes = '',
      numberOfWorkawayers = 'any',
      place = '',
      page = 1,
      limit = 3, // Default to 3 hosts per page
    } = req.query;

    const filter = {};

    if (hostTypes) {
      filter.selectedHelpTypes = { $in: hostTypes.split(',') };
    }

    if (hostWelcomes) {
      filter.allowed = { $in: hostWelcomes.split(',') };
    }

    if (place) {
      filter['address.display_name'] = { $regex: place, $options: 'i' };
    }

    if (numberOfWorkawayers !== 'any') {
      if (numberOfWorkawayers === 'more') {
        filter.numberOfWorkawayers = { $gt: 2 };
      } else {
        filter.numberOfWorkawayers = parseInt(numberOfWorkawayers);
      }
    }
console.log("filterss",filter);

    const skip = (page - 1) * limit;

    const [hosts, totalHosts] = await Promise.all([
      Host.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Host.countDocuments(filter),
    ]);
    console.log(hosts);
    

    const totalPages = Math.ceil(totalHosts / limit);

    res.status(200).json({
      hosts,
      currentPage: parseInt(page),
      totalPages,
      totalHosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err });
  }
}

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

exports.updateHost=async (req,res)=>{
  const { id } = req.params;
  const updates = req.body; 
console.log("eeeeeeeeeeeeditting",updates,id);

  try {
    const updatedHost = await Host.findByIdAndUpdate(id, updates, {
      new: true, // return updated doc
      runValidators: true,
    });

    if (!updatedHost) return res.status(404).json({ message: "Host not found" });

    res.json(updatedHost);
  } catch (error) {
    console.error("Error updating host:", error);
    res.status(500).json({ message: "Server error", error });
  }

}

exports.logoutHost=(req, res) => {
  res.clearCookie('hostToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({success:true, message: 'Logged out successfully' });
}