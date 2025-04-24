const User = require("../model/user")
const Message = require("../model/message")
const cloudinary = require("../config/cloudineryCofig");
const { getReceiverSocketId,io} = require("../lib/socket.io");
const Host = require("../model/host")
exports.getUsersForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user ? req.user.id : req.hostName?.id;

    console.log("Logged in user ID:", loggedUserId);

    // Fetch all volunteers except the logged-in user
    const volunteers = await User.find({ _id: { $ne: loggedUserId } }).select("-password");

    // Fetch all hosts except the logged-in user
    const hosts = await Host.find({ _id: { $ne: loggedUserId } }).select("-password");

    // Combine both
    const allUsers = [...volunteers, ...hosts];

    res.status(200).json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error("Error occurred in getUsersForSidebar:", error);

    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message || "Something went wrong"}`,
    });
  }
};
// getting all message between two users
exports.getMessages=async (req,res)=>{
    try {
      const loggedUserId = req.user ? req.user.id : req.hostName?.id;
   
      
        const senderId=loggedUserId
        const receverId=req.params.id
        
        const allMessages=await Message.find({
            $or:[
                {senderId:senderId,receverId:receverId},
                {senderId:receverId,receverId:senderId},

        ]

        })

        res.status(200).json({
          allmessagesBetweenThem:allMessages
        })
      
    } catch (error) {
        res.status(500).json({
            success:false,
           message:"internal erver error"
        })
        
    }

}

exports.sendMessage=async (req,res)=>{
    try {
      
      
        const {image,content,}=req.body
     
        const loggedUserId = req.user ? req.user.id : req.hostName?.id;
   
const receverId=req.params.id
console.log("rrrrrrecccccccved ,rec",receverId);

const senderId = loggedUserId


let imageUrl =""


if(image){
    const imageUploadResponse =await cloudinary.uploader.upload(image)
   imageUrl=imageUploadResponse.secure_url}


   const newMessage= new Message({
    senderId:senderId,
    receverId:receverId,
    image:imageUrl,
    content:content
   })
  console.log(newMessage)
await newMessage.save()

const receiverSocketId = getReceiverSocketId(receverId);
console.log("reciverid",receiverSocketId);

if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);  
}
console.log("endddddddddddding");


   res.status(200).json({
   newMessage
})

    } catch (error) {
console.log("eeror occcccccured",error);

        
    
      

        res.status(500).json({
            success:false,
           message:"internal erver error"
        })
        
    
        
    }
}