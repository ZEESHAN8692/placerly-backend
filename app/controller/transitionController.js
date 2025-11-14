import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ExecutorModel, executorValidation } from "../models/transitionModel.js";
import { UserModel } from "../models/userModel.js";
import sendMailExecutor, { ExecutorHasNotAccount, sendMailAcceptExecutor } from "../helper/sendMailExecutor.js";


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


      executor.requestToken = token;
      await executor.save();

      // Invite link (frontend URL)
      const inviteLink = `${process.env.CLIENT_URL}/executor/invite/${token}`;



      // Send Email
      await sendMailExecutor({
        to: executor.email,
        subject: "Executor Invitation - Placerly",
        owner: user,
        executor: {
          name: req.body.name,
          email: req.body.email
        },
        inviteLink
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

  async handleInviteAction(req, res) {
    try {
      const { action, token  } = req.body;

      if (!action || !token) {
        return res.status(400).json({
          success: false,
          message: "Action and token are required",
        });
      }

      // decode token
      let data;
      try {
        data = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      const executor = await ExecutorModel.findById(data.executorId)
        .populate("userId", "name email");

      if (!executor) {
        return res.status(404).json({
          success: false,
          message: "Executor not found",
        });
      }

      // -------------------------
      // ACTION HANDLERS
      // -------------------------

      // 1️ VALIDATE
      if (action === "validate") {
        return res.status(200).json({
          success: true,
          executorName: executor.name,
          ownerName: executor.userId.name,
          email: executor.email,
          status: executor.status,
        });
      }

      // 2️ ACCEPT
      if (action === "accept") {
        executor.status = "approved";
        executor.executorUserId = data.userId;
        executor.requestToken = null;
        await executor.save();

        await UserModel.findByIdAndUpdate(
          executor.userId,  
          {
            $addToSet: { transitions: executor._id } 
          }
        );

        await sendMailAcceptExecutor({
          to: executor.email,
          subject: "Executor Invitation Accepted - Placerly",
          owner: executor.userId,
          executor: {
            name: executor.name,
            email: executor.email
          },
        });

        const findUser = await UserModel.findOne({email: executor.email});
        if(!findUser){
          const user = await UserModel.create({
            name: executor.name,
            email: executor.email,
            phone: executor.contactNumber,
            password: `${executor.name.replace(/\s/g, '')}@123`,
            confirmPassword: `${executor.name.replace(/\s/g, '')}@123`,
            role: "executor",
            isVerified: true,
            transitions: [executor._id]
          });

          await ExecutorHasNotAccount({
            to: executor.email,
            subject: "Executor Invitation Accepted - Placerly",
            executor:{
              name: executor.name,
              email: executor.email,
              password: `${executor.name.replace(/\s/g, '')}@123`
            }
          })

        }else{
          await UserModel.findOneAndUpdate(
            {email: executor.email},
            {
              $addToSet: { transitions: executor._id } 
            }
          );
        }



        return res.status(200).json({
          success: true,
          message: "Executor invitation accepted",
        });
      }

      // 3️ REJECT
      if (action === "reject") {
        executor.status = "revoked";
        executor.requestToken = null;
        await executor.save();

        return res.status(200).json({
          success: true,
          message: "Executor invitation rejected",
        });
      }

      // Invalid action  
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });

    } catch (err) {
      console.error("Handle Invite Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
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
