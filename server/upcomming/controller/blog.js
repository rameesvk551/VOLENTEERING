
const User = require("../model/user")
const CustomError = require("../utils/customError"); 
const Blog = require("../model/blog")

exports.createBlog=async(req,res,next)=>{
    const {title,content}=req.body
    try {
       console.log("blog requet",req.body);
       const auther="Ramees"
      const newBlog=await new Blog({
        title:title,
        content:content,
        auther:auther
      })
    await  newBlog.save()
    res.status(201).json({ success: true, blog: newBlog ,message:"new blog created uccessfully"});
        
    } catch (error) {
        next(error)
    }

}