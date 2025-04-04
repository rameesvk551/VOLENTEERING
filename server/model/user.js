const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false }, // 🔒 Secure password
 travelStatus:{type:String},
 description:{type:String},
  role: { type: String, enum: ["volunteer", "host", "admin"], default: "volunteer" },
  profileImage: { type: String, default: "" },
  skills: { type: String }, 
  status:{type:String,default:"active"},
  availability: { type: String, enum: ["full-time", "part-time", "flexible"], default: "flexible" },
birthDate:{type:String},
activities:{type:String},
payments: [
  {
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Failed"], default: "Paid" },
    method: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {lastActive: Date},
],
  verified: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now, immutable: true } 
});

module.exports = mongoose.model("User", userSchema);
