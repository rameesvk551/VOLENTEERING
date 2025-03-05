const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: { type: String, },
    description: { type: String,  },
    selectedHelpTypes: { type: [String], default: [] },
    allowed: { type: [String], default: [] },
    accepted: { type: [String], default: [] },
    languageDescription: { type: String,  },
    languageAndLevel: [{
      language: { type: String, required: true },
      level: { type: String, required: true }
    }],
    showIntreastInLanguageExchange: { type: Boolean,  },
    privateComment: { type: String },
    organisation: { type: String },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // 🔒 Hide password in queries
    },
    images: {
      type: String,
      default: "https://example.com/default-avatar.png", // ✅ Change this to a real image URL
    },
    minimumStay: {
      type: String,
      enum: ["No Minimum", "One Week", "One Month"],
      default: "No Minimum",
    },
    maxHours: {
      type: String,
      enum: ["2-3 hours", "4-5 hours", "6+ hours"],
    },
    availability: {
      type: String,
      enum: ["Available", "Nearly Available", "Not Available"],
      default: "Available",
    },
    culturalExchange: {
      type: String,
    },
 
    role: {
      type: String,
      enum: ["host", "admin"],
      default: "host",
    },
  
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt automatically
);




module.exports =  mongoose.model("Host", hostSchema);