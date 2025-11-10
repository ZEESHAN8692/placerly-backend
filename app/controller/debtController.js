import mongoose from "mongoose";
import { DebtModel, debtValidation } from "../models/debtsModel.js";
import { UserModel } from "../models/userModel.js";

class DebtController {

  async createDebt(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

      const { error } = debtValidation.validate({ ...req.body, userId });
      if (error)
        return res.status(400).json({ success: false, message: error.details[0].message });

      const user = await UserModel.findById(userId);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      const debt = await DebtModel.create({
        userId,
        type: req.body.type,
        name: req.body.name,
        accountName: req.body.accountName,
        accountNumber: req.body.accountNumber,
        amount: req.body.amount || 0,
        dueDate: req.body.dueDate || null,
      });

      return res.status(201).json({
        success: true,
        message: "Debt added successfully",
        data: debt,
      });
    } catch (err) {
      console.error("Create Debt Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAllDebts(req, res) {
    try {
      const userId = req.user?._id;
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
            amount: 1,
            dueDate: 1,
            createdAt: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      const debts = await DebtModel.aggregate(pipeline);

       const debtsValue = await DebtModel.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$amount" } }  },
        {$unwind: "$total"},
      ]);

      return res.status(200).json({
        success: true,
        count: debts.length,
        data: debts,
        debtsValue: debtsValue
      });
    } catch (err) {
      console.error("Get All Debts Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getDebtById(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Debt ID" });

      const debt = await DebtModel.aggregate([
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
            amount: 1,
            dueDate: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
      ]);

      if (!debt || debt.length === 0)
        return res.status(404).json({ success: false, message: "Debt not found" });

      return res.status(200).json({ success: true, data: debt[0] });
    } catch (err) {
      console.error("Get Debt Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async updateDebt(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Debt ID" });

      const debt = await DebtModel.findOne({ _id: id, userId });
      if (!debt)
        return res
          .status(404)
          .json({ success: false, message: "Debt not found or unauthorized" });

      const updated = await DebtModel.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Debt updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Update Debt Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async deleteDebt(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Debt ID" });

      const debt = await DebtModel.findOneAndDelete({ _id: id, userId });
      if (!debt)
        return res
          .status(404)
          .json({ success: false, message: "Debt not found or unauthorized" });

      return res.status(200).json({
        success: true,
        message: "Debt deleted successfully",
      });
    } catch (err) {
      console.error("Delete Debt Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getTotalDebtsValue(req, res) {
    try {
      const userId = req.user?._id;

      const debts = await DebtModel.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      return res.status(200).json({ success: true, data: debts });
    } catch (err) {
      console.error("Get Total Debts Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new DebtController();
