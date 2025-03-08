const express=require("express")
const { hostLogin, hostSignup, fetchAddressPlaces, addDetails, loadHost } = require("../controller/host")
const upload = require("../config/multerConfig")
const { isHost } = require("../middleware/auth")

const app=express()
const router=express.Router()

router.post("/login",hostLogin)
router.post("/signup",hostSignup)
router.get("/places",fetchAddressPlaces)
router.post("/add-details", upload.array("images", 10), addDetails);
router.get("/load-host",isHost,loadHost)

module.exports=router