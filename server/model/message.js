const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
senderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
receverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
content:{
    type:String
},
image:{
    type:String
}

},
{timestamps:true}
)


module.exports =mongoose.model("Message",messageSchema)

