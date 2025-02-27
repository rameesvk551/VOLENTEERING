const express=require("express")
const { adminLogin, blockUser, getAllVolenteers, loadAdmin } = require("../controller/admin")
const { isAdmin } = require("../middleware/auth")
const app=express()
const router=express.Router()

router.post("/login",adminLogin)
router.get("/load-admin",isAdmin,loadAdmin)
router.get("/get-all-volenteers",getAllVolenteers)
router.put("/block-volenteer",blockUser)





module.exports=router