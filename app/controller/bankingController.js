import mongoose from "mongoose";
import { BankingModel, bankingValidation } from "../models/bankingModel.js";
import { UserModel } from "../models/userModel.js";
import { ExecutorModel } from "../models/transitionModel.js";

class BankingController {

  async createBanking(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

      const { error } = bankingValidation.validate({ ...req.body, userId });
      if (error)
        return res.status(400).json({ success: false, message: error.details[0].message });

      const user = await UserModel.findById(userId);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      const banking = await BankingModel.create({
        userId,
        type: req.body.type,
        accountName: req.body.accountName,
        accountNumber: req.body.accountNumber,
        balance: req.body.balance || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Banking record added successfully",
        data: banking,
      });
    } catch (err) {
      console.error("Create Banking Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

async getAllBankings(req, res) {
  try {
    let loggedInUserId = req.user?._id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    let actualUserId = loggedInUserId;

    if (req.user.role === "executor") {
      const executor = await ExecutorModel.findOne({
        email: req.user.email,
        status: "approved",
      });

      if (!executor) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned as executor to any user",
        });
      }

      actualUserId = executor.executorUserId;
    }

    const userObjectId = new mongoose.Types.ObjectId(actualUserId);

    const { type, search } = req.query;

    const matchStage = { userId: userObjectId };

    if (type) matchStage.type = type;
    if (search) matchStage.accountName = { $regex: search, $options: "i" };

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
          accountName: 1,
          accountNumber: 1,
          balance: 1,
          createdAt: 1,
          updatedAt: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const bankings = await BankingModel.aggregate(pipeline);

    const totalBalance = await BankingModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
    ]);

    return res.status(200).json({
      success: true,
      count: bankings.length,
      data: bankings,
      totalBalance: totalBalance[0]?.totalBalance || 0,
    });

  } catch (err) {
    console.error("Get All Banking Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


  async getBankingById(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Banking ID" });

      const banking = await BankingModel.aggregate([
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
            accountName: 1,
            accountNumber: 1,
            balance: 1,
            createdAt: 1,
            updatedAt: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
      ]);

      if (!banking || banking.length === 0)
        return res.status(404).json({ success: false, message: "Banking record not found" });

      return res.status(200).json({ success: true, data: banking[0] });
    } catch (err) {
      console.error("Get Banking By ID Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateBanking(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Banking ID" });

      const banking = await BankingModel.findOne({ _id: id, userId });
      if (!banking)
        return res.status(404).json({ success: false, message: "Banking record not found or unauthorized" });

      const updated = await BankingModel.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Banking record updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Update Banking Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async deleteBanking(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Banking ID" });

      const banking = await BankingModel.findOneAndDelete({ _id: id, userId });
      if (!banking)
        return res.status(404).json({ success: false, message: "Banking record not found or unauthorized" });

      return res.status(200).json({
        success: true,
        message: "Banking record deleted successfully",
      });
    } catch (err) {
      console.error("Delete Banking Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

    async getTotalBalance(req, res) {
    try {
      const userId = req.user?._id;
      const total = await BankingModel.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
      ]);

      return res.status(200).json({
        success: true,
        data: { totalBalance: total[0]?.totalBalance || 0 },
      });
    } catch (err) {
      console.error("Get Total Balance Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new BankingController();
