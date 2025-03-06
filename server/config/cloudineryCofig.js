const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader.upload("test-image.jpg", function (error, result) {
  if (error) {
    console.error("Cloudinary Error:", error);
  } else {
    console.log("Cloudinary Upload Success:", result.secure_url);
  }
});
