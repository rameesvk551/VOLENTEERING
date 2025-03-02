const express=require("express")
const { hostLogin, hostSignup, fetchAddressPlaces } = require("../controller/host")
const app=express()
const router=express.Router()

router.post("/login",hostLogin)
router.post("/signup",hostSignup)
router.get("/places",fetchAddressPlaces)



module.exports=router