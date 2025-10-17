const mongoose = require("mongoose");


const callSchema = new mongoose.Schema({
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number },

    status: { type: String, enum: ['completed', 'missed', 'rejected',"ongoing"] }
  });
  
  
  module.exports =mongoose.model("Call",callSchema)
  
  