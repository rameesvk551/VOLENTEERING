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
   
        avatar: {
            type: String,
            default: "https://example.com/default-avatar.png", // ✅ Change this to a real image URL
        },
        description: {
            type: String,
            maxlength: [500, "Description cannot exceed 500 characters"],
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

// Export the model
module.exports = mongoose.model("Host", hostSchema);
