import mongoose from "mongoose";
import { InvestmentModel, investmentValidation } from "../models/inventmentsModel.js";
import { UserModel } from "../models/userModel.js";
import { ExecutorModel } from "../models/transitionModel.js";

class InvestmentController {


  async createInvestment(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

      const { error } = investmentValidation.validate({ ...req.body, userId });
      if (error)
        return res.status(400).json({ success: false, message: error.details[0].message });

      const user = await UserModel.findById(userId);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      const investment = await InvestmentModel.create({
        userId,
        type: req.body.type,
        name: req.body.name,
        amount: req.body.amount,
        date: req.body.date,
        status: req.body.status || "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Investment added successfully",
        data: investment,
      });
    } catch (err) {
      console.error("Create Investment Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

 
async getAllInvestments(req, res) {
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

    const { type, search, status } = req.query;

    const matchStage = { userId: userObjectId };

    if (type) matchStage.type = type;
    if (status) matchStage.status = status;
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
          type: 1,
          name: 1,
          amount: 1,
          date: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const investments = await InvestmentModel.aggregate(pipeline);

    const totalInvestment = await InvestmentModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    return res.status(200).json({
      success: true,
      count: investments.length,
      data: investments,
      totalInvestment: totalInvestment[0]?.totalAmount || 0,
    });

  } catch (err) {
    console.error("Get All Investments Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


  
  async getInvestmentById(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Investment ID" });

      const investment = await InvestmentModel.aggregate([
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
            name: 1,
            amount: 1,
            date: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
      ]);

      if (!investment || investment.length === 0)
        return res.status(404).json({ success: false, message: "Investment not found" });

      return res.status(200).json({ success: true, data: investment[0] });
    } catch (err) {
      console.error("Get Investment By ID Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

 
  async updateInvestment(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Investment ID" });

      const investment = await InvestmentModel.findOne({ _id: id, userId });
      if (!investment)
        return res.status(404).json({ success: false, message: "Investment not found or unauthorized" });

      const updated = await InvestmentModel.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Investment updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Update Investment Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async deleteInvestment(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Investment ID" });

      const investment = await InvestmentModel.findOneAndDelete({ _id: id, userId });
      if (!investment)
        return res.status(404).json({ success: false, message: "Investment not found or unauthorized" });

      return res.status(200).json({
        success: true,
        message: "Investment deleted successfully",
      });
    } catch (err) {
      console.error("Delete Investment Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

 
  async getTotalInvestmentValue(req, res) {
    try {
      const userId = req.user?._id;

      const total = await InvestmentModel.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]);

      return res.status(200).json({
        success: true,
        data: { totalInvestment: total[0]?.totalAmount || 0 },
      });
    } catch (err) {
      console.error("Get Total Investment Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new InvestmentController();
