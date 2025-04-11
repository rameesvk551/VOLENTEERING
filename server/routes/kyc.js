const express=require("express")
const { isAuthenticated } = require("../middleware/auth")
const { submitKyc } = require("../controller/kyc")
const upload = require("../config/multerConfig")
const app=express()
const router=express.Router()

router.post(
    "/submit-kyc",
    isAuthenticated,
    upload.fields([
      { name: "idFront", maxCount: 1 },
      { name: "idBack", maxCount: 1 },
      { name: "selfie", maxCount: 1 },
    ]),
    submitKyc
  );
  

module.exports = router;
