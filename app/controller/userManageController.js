import { UserModel, userValidation } from "../models/userModel.js";
import mongoose from "mongoose";

class UserManageController {
  
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.aggregate([
        {
          $lookup: {
            from: "transitions", // Transition collection name (lowercase plural)
            localField: "transitions",
            foreignField: "_id",
            as: "transitionData",
          },
        },
        {
          $lookup: {
            from: "subscriptions", // Subscription collection name
            localField: "subscription.planId",
            foreignField: "_id",
            as: "subscriptionDetails",
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            role: 1,
            status: 1,
            isVerified: 1,
            createdAt: 1,
            transitionData: 1,
            subscriptionDetails: 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

 
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User ID" });
      }

      const user = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "transitions",
            localField: "transitions",
            foreignField: "_id",
            as: "transitionData",
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "subscription.planId",
            foreignField: "_id",
            as: "subscriptionDetails",
          },
        },
      ]);

      if (!user || user.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, data: user[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

 
async updateUser(req, res) {
  try {
    const { id } = req.params;

    // Validate other fields (like email or name) if provided in the body
    if (req.body.email) {
      const { error } = userValidation.validate(req.body);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Update user (without updating the password)
    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("transitions");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await UserModel.findByIdAndDelete(id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new UserManageController();
