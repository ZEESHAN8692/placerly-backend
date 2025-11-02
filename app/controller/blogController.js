import { BlogModel, blogValidation } from "../models/blogModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";

class BlogController {


  async createBlog(req, res) {
    try {
      const { error } = blogValidation.validate(req.body);
      if (error)
        return res.status(400).json({ success: false, message: error.details[0].message });

      let imageUrl = null;
      let public_id = null;

    
      if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path, "blogs");
        imageUrl = uploaded.secure_url;
        public_id = uploaded.public_id;
      }

      const slug = slugify(req.body.title, { lower: true, strict: true });

      const blog = await BlogModel.create({
        title: req.body.title,
        subject: req.body.subject,
        description: req.body.description,
        coverImage: imageUrl,
        public_id,
        status: req.body.status || "active",
        author: req.body.author || "Admin",
        slug,
      });

      return res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
      });
    } catch (err) {
      console.error("Create Blog Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async updateBlog(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid blog ID" });

      const blog = await BlogModel.findById(id);
      if (!blog)
        return res.status(404).json({ success: false, message: "Blog not found" });

      let newImageUrl = blog.coverImage;
      let newPublicId = blog.public_id;

      
      if (req.file) {
        if (blog.public_id) {
          await deleteFromCloudinary(blog.public_id);
        }
        const uploaded = await uploadOnCloudinary(req.file.path, "blogs");
        newImageUrl = uploaded.secure_url;
        newPublicId = uploaded.public_id;
      }

   
      let newSlug = blog.slug;
      if (req.body.title && req.body.title !== blog.title) {
        newSlug = slugify(req.body.title, { lower: true, strict: true });
      }

      const updatedBlog = await BlogModel.findByIdAndUpdate(
        id,
        {
          ...req.body,
          coverImage: newImageUrl,
          public_id: newPublicId,
          slug: newSlug,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: updatedBlog,
      });
    } catch (err) {
      console.error("Update Blog Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async deleteBlog(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid blog ID" });

      const blog = await BlogModel.findById(id);
      if (!blog)
        return res.status(404).json({ success: false, message: "Blog not found" });

 
      if (blog.public_id) {
        await deleteFromCloudinary(blog.public_id);
      }

      await BlogModel.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (err) {
      console.error("Delete Blog Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async getAllBlogs(req, res) {
    try {
      const { search, status = "active", author } = req.query;


      const pipeline = [];


      pipeline.push({ $match: { status } });


      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { subject: { $regex: search, $options: "i" } },
            ],
          },
        });
      }


      if (author) {
        pipeline.push({ $match: { author } });
      }
      pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({
        $project: {
          _id: 1,
          title: 1,
          subject: 1,
          slug: 1,
          author: 1,
          coverImage: 1,
          createdAt: 1,
          status: 1,
        },
      });

      const blogs = await BlogModel.aggregate(pipeline);

      return res.status(200).json({
        success: true,
        count: blogs.length,
        data: blogs,
      });
    } catch (err) {
      console.error("Get All Blogs Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  
  async getBlogBySlug(req, res) {
    try {
      const { slug } = req.params;

      const blog = await BlogModel.aggregate([
        { $match: { slug, status: "active" } },
        {
          $project: {
            _id: 1,
            title: 1,
            subject: 1,
            description: 1,
            slug: 1,
            coverImage: 1,
            author: 1,
            createdAt: 1,
          },
        },
      ]);

      if (!blog || blog.length === 0)
        return res.status(404).json({ success: false, message: "Blog not found" });

      return res.status(200).json({
        success: true,
        data: blog[0],
      });
    } catch (err) {
      console.error("Get Blog by Slug Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new BlogController();
