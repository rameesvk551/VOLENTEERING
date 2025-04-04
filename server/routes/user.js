const express=require("express")
const { userLogin, userSignup, addDetails, loadVolenteer, updateProfile } = require("../controller/user")
const { isAuthenticated } = require("../middleware/auth")
const upload = require("../config/multerConfig")
const router=express.Router()

router.post("/login",userLogin)
router.post("/signup",userSignup)
router.post("/add-details/:id",addDetails)
router.get("/load-volenteer",isAuthenticated,loadVolenteer)
router.put("/update-profile", isAuthenticated, upload.single("profileImage"), updateProfile);





module.exports=router