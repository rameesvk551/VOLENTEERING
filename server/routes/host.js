const express=require("express")
const { hostLogin, hostSignup, fetchAddressPlaces, addDetails, loadHost, updateHost, logoutHost } = require("../controller/host")
const upload = require("../config/multerConfig")
const { isHost } = require("../middleware/auth")
const updateLastActive = require("../middleware/updateLastActive")

const app=express()
const router=express.Router()

router.post("/login",hostLogin)
router.post("/signup",hostSignup)
router.get("/places",fetchAddressPlaces)
router.post("/add-details", isHost,addDetails);
router.get("/load-host",isHost,loadHost)
router.put("/profile-update/:id",updateHost)
router.post("/logout",isHost,logoutHost)
module.exports=router