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
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    helpType: [
      {
        type: String,
        enum: [
          "Gardening",
          "Help with Computers",
          "Teaching",
          "Animal Care",
          "Cooking",
          "Construction",
          "CharityWork",
          "AnimalCare",
          "LanguageExchange",
          "ArtProject",
          "Gardening",
          "Help with Computers",
          "Teaching",
          "Animal Care",
          "Hospitality/Tourim",
          "GeneralMaintanance",
          "cooking",
          "FamilyHelp"
        ],
      },
    ],
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
    languages: [
      {
        language: { type: String },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Fluent"],
        },
      },
    ],
    accommodationDescription: {
      type: String,
    },
    role: {
      type: String,
      enum: ["host", "admin"],
      default: "host",
    },
    acceptingTravellers: [
      {
        type: String,
        enum: ["Digital Nomad", "Family", "Handicapped"],
      },
    ],
    address: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt automatically
);

// Export the model
module.exports = mongoose.model("Host", hostSchema);
