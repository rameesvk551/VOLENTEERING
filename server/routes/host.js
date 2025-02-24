const express=require("express")
const { hostLogin, hostSignup } = require("../controller/host")
const app=express()
const router=express.Router()

router.post("/login",hostLogin)
router.post("/signup",hostSignup)




module.exports=router