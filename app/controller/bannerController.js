import { BannerModel, bannerValidation } from "../models/bannerModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

class BannerController {
  // Create banner
  async createBanner(req, res) {
    try {
      const { error } = bannerValidation.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const result = await uploadOnCloudinary(req.file.path);
      console.log(result);
      const bannerData = {
        title: req.body.title,
        description: req.body.description,
        imageUrl: result.secure_url,
        public_id: result.public_id,
        link: req.body.link,
        isActive: req.body.isActive ?? true,
      };

      const banner = new BannerModel(bannerData);
      await banner.save();

      res.status(201).json({ message: "Banner created successfully", banner });
    } catch (error) {
      res.status(500).json({ message: "Error creating banner", error: error.message });
    }
  }

  // Get all banners
  async getBanners(req, res) {
    try {
      const banners = await BannerModel.find();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Error fetching banners", error: error.message });
    }
  }

  // Get banner by ID
  async getBannerById(req, res) {
    try {
      const banner = await BannerModel.findById(req.params.id);
      if (!banner) return res.status(404).json({ message: "Banner not found" });
      res.json(banner);
    } catch (error) {
      res.status(500).json({ message: "Error fetching banner", error: error.message });
    }
  }

  // Update banner
  async updateBanner(req, res) {
    try {
      const { error } = bannerValidation.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const banner = await BannerModel.findById(req.params.id);
      if (!banner) return res.status(404).json({ message: "Banner not found" });

      // Agar nayi image ayegi, to pehla image delete karenge Cloudinary se
      if (req.file) {
        if (banner.public_id) {
          await deleteFromCloudinary(banner.public_id);
        }
        const result = await uploadOnCloudinary(req.file.path);
        banner.imageUrl = result.secure_url;
      }

      banner.title = req.body.title ?? banner.title;
      banner.description = req.body.description ?? banner.description;
      banner.link = req.body.link ?? banner.link;
      banner.isActive = req.body.isActive ?? banner.isActive;
      banner.updatedAt = Date.now();

      await banner.save();

      res.json({ message: "Banner updated", banner });
    } catch (error) {
      res.status(500).json({ message: "Error updating banner", error: error.message });
    }
  }

  // Delete banner
  async deleteBanner(req, res) {
    try {
      const banner = await BannerModel.findById(req.params.id);
      if (!banner) return res.status(404).json({ message: "Banner not found" });

      if (banner.public_id) {
        await deleteFromCloudinary(banner.public_id);
      }

      await BannerModel.deleteOne({ _id: req.params.id });

      res.json({ message: "Banner deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting banner", error: error.message });
    }
  }
}

export default new BannerController();

