const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false }, // 🔒 Secure password
 travelStatus:{type:String},
 description:{type:String},
  role: { type: String, enum: ["volunteer", "host", "admin","user"], default: "user" },
  profileImage: { type: String, default: "" },
  skills: [{ type: String }], 
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  activities: [{ type: String }],
  status: { type: String, default: "inactive", enum: ["active", "inactive"] },
  membershipStartDate: { type: Date },
  kycStatus: {
    type: String,
    enum: ["none", "pending", "verified", "rejected"],
    default: "none"
  },
  kycDetailsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KycDetails"
  },
  
  nextDestination:{
    destination:String,
    fromDate:Date,
    toDate:Date
  },
lastMessageTime:{
  type: Date, 
},
birthDate:{type:String},
payments: [
  {
    orderId: { type: String},
    paymentId: { type: String },
    amount: { type: Number },
    status: { type: String, enum: ["Paid", "Failed"], default: "Paid" },
    method: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {lastActive: Date},
],
reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  verified: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now, immutable: true } 
});

module.exports = mongoose.model("User", userSchema);
