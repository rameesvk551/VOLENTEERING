const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const sharp = require("sharp");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileBuffer, folder, filename) => {
  try {
    const compressedBuffer = await sharp(fileBuffer)
      .resize(1024) // resize width to 1024px, keeps aspect ratio
      .jpeg({ quality: 70 }) // compress JPEG quality to 70%
      .toBuffer();

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          resource_type: "image",
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      ).end(compressedBuffer);
    });
  } catch (err) {
    console.error("Compression/Upload Error:", err);
    throw err;
  }
};



module.exports = {
  cloudinary,
  uploadToCloudinary,
};
