const mongoose=require ("mongoose")


// Blog Schema
const BlogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        summary: { type: String, trim: true },
        category: { type: String,  },
        tags: { type: [String], default: [] },
       
        published: { type: Boolean, default: false }, 
    },
    { timestamps: true }
);

module.exports= mongoose.model("Blog", BlogSchema);
