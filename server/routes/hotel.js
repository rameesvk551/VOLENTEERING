const express=require("express")
const { getHotels } = require("../controller/hotel")

const app=express()
const router=express.Router()

router.post("/get-hotels",getHotels)


module.exports=router