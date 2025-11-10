
import { AssetsModel, assetValidation } from "../models/assetsModel.js";
import { UserModel } from "../models/userModel.js";
import mongoose from "mongoose";

class AssetController {

  async createAsset(req, res) {
    try {

      const userId = req.user?._id;
      console.log("User Id :", userId);
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const { error } = assetValidation.validate(req.body);
      if (error)
        return res.status(400).json({ success: false, message: error.details[0].message });

      const user = await UserModel.findById(userId);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });


      const asset = await AssetsModel.create({
        userId: userId,
        type: req.body.type,
        name: req.body.name,
        accountName: req.body.accountName,
        accountNumber: req.body.accountNumber,
        balance: req.body.balance || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Asset added successfully",
        data: asset,
      });
    } catch (err) {
      console.error("Create Asset Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAllAssets(req, res) {
    try {
      const userId = req.user?._id;
      console.log("User Id :", userId);
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

      const { type, search } = req.query;

      const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
      if (type) matchStage.type = type;
      if (search) matchStage.name = { $regex: search, $options: "i" };

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            name: 1,
            type: 1,
            accountName: 1,
            accountNumber: 1,
            balance: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      const assets = await AssetsModel.aggregate(pipeline);
      const totalAssetsValue = await AssetsModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$balance" },
          },
        }
      ])

      return res.status(200).json({
        success: true,
        count: assets.length,
        totalAssetsValue: totalAssetsValue,
        data: assets,
        
      });
    } catch (err) {
      console.error("Get All Assets Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async getAssetById(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Asset ID" });

      const asset = await AssetsModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            name: 1,
            type: 1,
            accountName: 1,
            accountNumber: 1,
            balance: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
      ]); 

      if (!asset || asset.length === 0)
        return res.status(404).json({ success: false, message: "Asset not found" });

      return res.status(200).json({ success: true, data: asset[0] });
    } catch (err) {
      console.error("Get Asset Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async updateAsset(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Asset ID" });

      const asset = await AssetsModel.findOne({ _id: id, userId });
      if (!asset)
        return res.status(404).json({ success: false, message: "Asset not found or unauthorized" });

      const updated = await AssetsModel.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Asset updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Update Asset Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async deleteAsset(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Asset ID" });

      const asset = await AssetsModel.findOneAndDelete({ _id: id, userId });
      if (!asset)
        return res.status(404).json({ success: false, message: "Asset not found or unauthorized" });

      return res.status(200).json({
        success: true,
        message: "Asset deleted successfully",
      });
    } catch (err) {
      console.error("Delete Asset Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getTotalAssetsValue (req, res) {
    try {
      const userId = req.user?._id;

      const total = await AssetsModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$balance" },
          },
        },
      ])
      return res.status(200).json({ success: true, data: total });
    } catch (err) {
      console.error("Get Total Assets Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new AssetController();
