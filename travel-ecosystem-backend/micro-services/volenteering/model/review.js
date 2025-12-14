const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now
    },
    reviewerName: {
      type: String,
      required: true,
    },
    reviewerId: {
        type: String,
        required: true,
      },
     hostId: {
        type: String,
        required: true,
      },
    reviewerProfile: {
      type: String, // You can store a URL to the profile image or profile link
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Review', reviewSchema);

