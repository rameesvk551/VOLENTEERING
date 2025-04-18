const express=require("express")
const { getMessages, sendMessage, getUsersForSidebar } = require("../controller/message")
const { isAuthenticated } = require("../middleware/auth")

const app=express()
const router=express.Router()

router.get("/messages/:id",isAuthenticated,getMessages)
router.get("/get-all-users",isAuthenticated,getUsersForSidebar)
router.post("/send-message/:id",isAuthenticated,sendMessage)

module.exports = router;
