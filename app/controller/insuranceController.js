import mongoose from "mongoose";
import { InsuranceModel, insuranceValidation } from "../models/insuranceModel.js";
import { UserModel } from "../models/userModel.js";

class InsuranceController {
  async createInsurance(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized access" });


      const { error } = insuranceValidation.validate({ ...req.body, userId });
      if (error)
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });

  
      const user = await UserModel.findById(userId);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

    
      const insurance = await InsuranceModel.create({
        userId,
        type: req.body.type,
        provider: req.body.provider,
        policyNumber: req.body.policyNumber,
        expiryDate: req.body.expiryDate || null,
        coverageAmount: req.body.coverageAmount || 0,
        premium: req.body.premium || 0,
        renewalDate: req.body.renewalDate || null,
      });

      return res.status(201).json({
        success: true,
        message: "Insurance added successfully",
        data: insurance,
      });
    } catch (err) {
      console.error("Create Insurance Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async getAllInsurances(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized access" });

      const { type, provider, search } = req.query;

      const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
      if (type) matchStage.type = type;
      if (provider) matchStage.provider = provider;
      if (search)
        matchStage.policyNumber = { $regex: search, $options: "i" };

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
            type: 1,
            provider: 1,
            policyNumber: 1,
            expiryDate: 1,
            coverageAmount: 1,
            premium: 1,
            renewalDate: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      const insurances = await InsuranceModel.aggregate(pipeline);

      return res.status(200).json({
        success: true,
        count: insurances.length,
        data: insurances,
      });
    } catch (err) {
      console.error("Get All Insurances Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async getInsuranceById(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid Insurance ID" });

      const insurance = await InsuranceModel.aggregate([
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
            type: 1,
            provider: 1,
            policyNumber: 1,
            expiryDate: 1,
            coverageAmount: 1,
            premium: 1,
            renewalDate: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
      ]);

      if (!insurance || insurance.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "Insurance not found" });

      return res.status(200).json({ success: true, data: insurance[0] });
    } catch (err) {
      console.error("Get Insurance Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async updateInsurance(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid Insurance ID" });

      const insurance = await InsuranceModel.findOne({ _id: id, userId });
      if (!insurance)
        return res
          .status(404)
          .json({
            success: false,
            message: "Insurance not found or unauthorized",
          });

      const updated = await InsuranceModel.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Insurance updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Update Insurance Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  
  async deleteInsurance(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid Insurance ID" });

      const insurance = await InsuranceModel.findOneAndDelete({
        _id: id,
        userId,
      });
      if (!insurance)
        return res
          .status(404)
          .json({ success: false, message: "Insurance not found or unauthorized" });

      return res.status(200).json({
        success: true,
        message: "Insurance deleted successfully",
      });
    } catch (err) {
      console.error("Delete Insurance Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new InsuranceController();
