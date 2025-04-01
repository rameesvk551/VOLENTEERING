const express=require("express")
const { userLogin, userSignup, addDetails, loadVolenteer } = require("../controller/user")
const { isAuthenticated } = require("../middleware/auth")
const router=express.Router()

router.post("/login",userLogin)
router.post("/signup",userSignup)
router.post("/add-details/:id",addDetails)
router.get("/load-volenteer",isAuthenticated,loadVolenteer)




module.exports=router