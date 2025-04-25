const express=require("express")
const { getHotels } = require("../controller/hotel")
const { getFlights } = require("../controller/flight")

const app=express()
const router=express.Router()

router.get("/get-flights",getFlights)


module.exports=router