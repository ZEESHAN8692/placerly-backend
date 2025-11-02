import mongoose from "mongoose";
import Joi from "joi";


 const blogValidation = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  subject: Joi.string().min(3).max(100).required(),
  coverImage: Joi.string().optional(),
  description: Joi.string().min(10).required(),
  author: Joi.string().optional(),
  status: Joi.string().valid("active", "inactive").default("active"),
});



const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    coverImage: { type: String }, 
    description: { type: String, required: true },
    author: { type: String, default: "Admin" },
    slug: { type: String, unique: true },

    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    public_id: { type: String },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);



 const BlogModel = mongoose.model("Blog", blogSchema);

 export {
  BlogModel,
  blogValidation
 }
