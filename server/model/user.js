const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false }, // 🔒 Secure password
 
  role: { type: String, enum: ["volunteer", "host", "admin"], default: "volunteer" },
  avatar: { type: String, default: "" },
  skills: [{ type: String }], 
  availability: { type: String, enum: ["full-time", "part-time", "flexible"], default: "flexible" },

  verified: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now, immutable: true } // 📅 Prevent accidental modification
});

module.exports = mongoose.model("User", userSchema);
