const express=require("express")
const { getHosts, getHostById } = require("../controller/host")
const router=express.Router()

router.get("/hosts",getHosts)
router.get("/host-details/:id",getHostById)




module.exports=router