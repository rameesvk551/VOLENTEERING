const express=require("express")
const { adminLogin, blockUser, getAllVolenteers, loadAdmin, getAllHosts } = require("../controller/admin")
const { isAdmin } = require("../middleware/auth")
const app=express()
const router=express.Router()

router.post("/login",adminLogin)
router.get("/load-admin",isAdmin,loadAdmin)
router.get("/get-all-volenteers",getAllVolenteers)
router.put("/block-volenteer",blockUser)
router.get("/get-all-hosts",getAllHosts)





module.exports=router