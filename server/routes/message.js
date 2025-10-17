const express=require("express")
const { getMessages, sendMessage, getUsersForSidebar } = require("../controller/message")
const { isAuthenticated, hostOrVolenteer } = require("../middleware/auth")

const app=express()
const router=express.Router()

router.get("/messages/:id",hostOrVolenteer,getMessages)
router.get("/get-all-users",hostOrVolenteer,getUsersForSidebar)
router.post("/send-message/:id",hostOrVolenteer,sendMessage)

module.exports = router;
