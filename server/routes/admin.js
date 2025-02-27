const express=require("express")
const { adminLogin, blockUser, getAllVolenteers } = require("../controller/admin")
const { isAdmin } = require("../middleware/auth")
const app=express()
const router=express.Router()

router.post("/login",adminLogin)
router.get("/get-all-volenteers",getAllVolenteers)
router.put("/block-volenteer",blockUser)





module.exports=router