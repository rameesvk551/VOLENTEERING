const express=require("express")
const { createBlog } = require("../controller/blog")
const { isAdmin } = require("../middleware/auth")
const app=express()
const router=express.Router()


router.post("/create-blog",isAdmin,createBlog)





module.exports=router