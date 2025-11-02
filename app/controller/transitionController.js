import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ExecutorModel , executorValidation } from "../models/TransitionModel.js";
import { UserModel } from "../models/userModel.js";
import sendMailExecutor from "../helper/sendMailExecutor.js";


class ExecutorController {

  async createExecutor(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized access" });
      const { error } = executorValidation.validate({ ...req.body, userId });
      if (error)
        return res.status(400).json({ success: false, message: error.details[0].message });
      const user = await UserModel.findById(userId);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });
      const executor = await ExecutorModel.create({
        userId,
        name: req.body.name,
        email: req.body.email,
        contactNumber: req.body.contactNumber,
      });


      const payload = {
        executorId: executor._id.toString(),
        userId: userId.toString(),
        executorEmail: req.body.email,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

      // Save token to DB
      executor.requestToken = token;
      await executor.save();

      // Invite link (frontend URL)
      const inviteLink = `${process.env.APP_URL}/executor/invite/${token}`;

      // Email content
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333">
          <h2>Hello ${executor.name},</h2>
          <p>${user.name} has added you as their <strong>Executor</strong> on <b>Placerly</b>.</p>
          <p>To accept the invitation and gain access, please click the link below:</p>
          <p><a href="${inviteLink}" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Accept Invitation</a></p>
          <p>This link will expire in 7 days.</p>
          <br/>
          <p>Thank you,</p>
          <p><strong>Placerly Team</strong></p>
        </div>
      `;

      // Send Email
      await sendMailExecutor({
        to: executor.email,
        subject: "Executor Invitation - Placerly",
        html,
      });

      return res.status(201).json({
        success: true,
        message: "Executor added and invitation email sent successfully",
        data: executor,
      });
    } catch (err) {
      console.error("Create Executor Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async getAllExecutors(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

      const { search, status } = req.query;
      const matchStage = { userId: new mongoose.Types.ObjectId(userId) };

      if (status) matchStage.status = status;
      if (search)
        matchStage.name = { $regex: search, $options: "i" };

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
            email: 1,
            contactNumber: 1,
            status: 1,
            createdAt: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      const executors = await ExecutorModel.aggregate(pipeline);

      return res.status(200).json({
        success: true,
        count: executors.length,
        data: executors,
      });
    } catch (err) {
      console.error("Get All Executors Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET Single Executor
  async getExecutorById(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Executor ID" });

      const executor = await ExecutorModel.aggregate([
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
            email: 1,
            contactNumber: 1,
            status: 1,
            createdAt: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
          },
        },
      ]);

      if (!executor || executor.length === 0)
        return res.status(404).json({ success: false, message: "Executor not found" });

      return res.status(200).json({ success: true, data: executor[0] });
    } catch (err) {
      console.error("Get Executor Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // UPDATE Executor
  async updateExecutor(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Executor ID" });

      const executor = await ExecutorModel.findOne({ _id: id, userId });
      if (!executor)
        return res.status(404).json({
          success: false,
          message: "Executor not found or unauthorized",
        });

      const updated = await ExecutorModel.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Executor updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Update Executor Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  //  DELETE Executor
  async deleteExecutor(req, res) {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid Executor ID" });

      const executor = await ExecutorModel.findOneAndDelete({ _id: id, userId });
      if (!executor)
        return res.status(404).json({
          success: false,
          message: "Executor not found or unauthorized",
        });

      return res.status(200).json({
        success: true,
        message: "Executor deleted successfully",
      });
    } catch (err) {
      console.error("Delete Executor Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new ExecutorController();
