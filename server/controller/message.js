const User = require("../model/user")
const Message = require("../model/message")
const cloudinary = require("../config/cloudineryCofig");
const { getReceiverSocketId,io} = require("../lib/socket.io");

exports.getUsersForSidebar = async (req,res) => {
  try {
    console.log("hhhhhhhhhhhhit");
    
   
    const loggedUserId = req.user.id;
    console.log("userrr",loggedUserId);
    
    
    // Fetch all users except the logged-in user
    const filteredUsers = await User.find({ _id: { $ne: loggedUserId } }).select("-password");

    res.status(200).json({
      success: true,
      users: filteredUsers,
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
        const senderId=req.user.id.toString();
        const receverId=req.params.id
        console.log(senderId,receverId,"ffffffffrrijrijgijibj");
        
        const allMessages=await Message.find({
            $or:[
                {senderId:senderId,receverId:receverId},
                {senderId:receverId,receverId:senderId},

        ]

        })
console.log("aaaaaaaaaaaal meages ",allMessages);

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
     
        
const receverId=req.params.id
const senderId = req.user.id.toString();

console.log("recied",req.body,receverId);

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