const express=require("express")
const { getHotels } = require("../controller/hotel")
const { getAttractions } = require("../controller/tripPlanning")

const app=express()
const router=express.Router()

router.get("/get-attractions/:place",getAttractions)


module.exports=router