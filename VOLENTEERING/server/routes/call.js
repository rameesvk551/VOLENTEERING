const express=require("express")
const { getAllCalls } = require("../controller/call")
const { hostOrVolenteer } = require("../middleware/auth")

const app=express()
const router=express.Router()

router.get("/get-calls",hostOrVolenteer,getAllCalls)


module.exports=router