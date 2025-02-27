const mongoose=require("mongoose")

 const dbConnect =async()=>{
    try {
        await mongoose.connect("mongodb+srv://rameesvk551:cQuIvOXhtgSm7EFj@cluster0.bjoel.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",      )
        console.log("mmmmmmongo db connected");
    } catch (error) {
       console.log("mobgodb connection error",error);
        process.exit(1)
    }

}


module.exports =dbConnect