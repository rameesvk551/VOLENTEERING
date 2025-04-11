const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const { uploadToCloudinary } = require("../config/cloudineryCofig");

exports.submitKyc = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);

    const userId = req.user.id;
    const folder = `kyc/${userId}`;

    // Read file from disk
    const idFrontBuffer = fs.readFileSync(req.files["idFront"][0].path);
    const idBackBuffer = fs.readFileSync(req.files["idBack"][0].path);
    const selfieBuffer = fs.readFileSync(req.files["selfie"][0].path);

    // Upload to Cloudinary
    const idFrontUrl = await uploadToCloudinary(idFrontBuffer, folder, "idFront");
    console.log("idFront Cloudinary URL:", idFrontUrl);
    
    const idBackUrl = await uploadToCloudinary(idBackBuffer, folder, "idBack");
    console.log("idBack Cloudinary URL:", idBackUrl);
    
    const selfieUrl = await uploadToCloudinary(selfieBuffer, folder, "selfie");
    console.log("selfie Cloudinary URL:", selfieUrl);
    
    console.log("Uploaded to Cloudinary");

    // Face++ API call
    const faceppResponse = await axios.post(
      "https://api-us.faceplusplus.com/facepp/v3/compare",
      null,
      {
        params: {
          api_key: process.env.FACEPP_API_KEY,
          api_secret: process.env.FACEPP_API_SECRET,
          image_url1: idFrontUrl,
          image_url2: selfieUrl,
        },
      }
    );

    const { confidence, thresholds } = faceppResponse.data;
    const isMatch = confidence > thresholds["1e-3"];

    if (!isMatch) {
      return res.status(400).json({ message: "Face verification failed" });
    }

    res.status(200).json({
      message: "KYC submitted successfully",
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      confidence,
    });
  } catch (err) {
    console.error("KYC Submit Error:", err?.response?.data || err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
