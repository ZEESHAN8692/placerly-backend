import mongoose from "mongoose";
import { UtilsModel, utilsValidation } from "../models/utilsModel.js";
import { UserModel } from "../models/userModel.js";

class UtilsController {

    async createUtils(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId)
                return res.status(401).json({ success: false, message: "Unauthorized access" });


            const { error } = utilsValidation.validate({ ...req.body, userId });
            if (error)
                return res.status(400).json({ success: false, message: error.details[0].message });


            const user = await UserModel.findById(userId);
            if (!user)
                return res.status(404).json({ success: false, message: "User not found" });


            const utility = await UtilsModel.create({
                userId,
                type: req.body.type,
                name: req.body.name,
                accountNumber: req.body.accountNumber,
                billingCycle: req.body.billingCycle || null,
                outstandingBill: req.body.outstandingBill || 0,
            });

            return res.status(201).json({
                success: true,
                message: "Utility added successfully",
                data: utility,
            });
        } catch (err) {
            console.error("Create Utility Error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }


    async getAllUtils(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId)
                return res.status(401).json({ success: false, message: "Unauthorized access" });

            const { type, search } = req.query;

            const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
            if (type) matchStage.type = type;
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
                        type: 1,
                        name: 1,
                        accountNumber: 1,
                        billingCycle: 1,
                        outstandingBill: 1,
                        createdAt: 1,
                        "userDetails.name": 1,
                        "userDetails.email": 1,
                    },
                },
                { $sort: { createdAt: -1 } },
            ];

            const utils = await UtilsModel.aggregate(pipeline);

            return res.status(200).json({
                success: true,
                count: utils.length,
                data: utils,
            });
        } catch (err) {
            console.error("Get All Utilities Error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }


    async getUtilsById(req, res) {
        try {
            const userId = req.user?._id;
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id))
                return res.status(400).json({ success: false, message: "Invalid Utility ID" });

            const utility = await UtilsModel.aggregate([
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
                        accountNumber: 1,
                        billingCycle: 1,
                        outstandingBill: 1,
                        createdAt: 1,
                        "userDetails.name": 1,
                        "userDetails.email": 1,
                    },
                },
            ]);

            if (!utility || utility.length === 0)
                return res.status(404).json({ success: false, message: "Utility not found" });

            return res.status(200).json({ success: true, data: utility[0] });
        } catch (err) {
            console.error("Get Utility Error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }


    async updateUtils(req, res) {
        try {
            const userId = req.user?._id;
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id))
                return res.status(400).json({ success: false, message: "Invalid Utility ID" });

            const utility = await UtilsModel.findOne({ _id: id, userId });
            if (!utility)
                return res.status(404).json({
                    success: false,
                    message: "Utility not found or unauthorized",
                });

            const updated = await UtilsModel.findByIdAndUpdate(
                id,
                { ...req.body, updatedAt: new Date() },
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                success: true,
                message: "Utility updated successfully",
                data: updated,
            });
        } catch (err) {
            console.error("Update Utility Error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }


    async deleteUtils(req, res) {
        try {
            const userId = req.user?._id;
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id))
                return res.status(400).json({ success: false, message: "Invalid Utility ID" });

            const utility = await UtilsModel.findOneAndDelete({ _id: id, userId });
            if (!utility)
                return res.status(404).json({
                    success: false,
                    message: "Utility not found or unauthorized",
                });

            return res.status(200).json({
                success: true,
                message: "Utility deleted successfully",
            });
        } catch (err) {
            console.error("Delete Utility Error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }
}

export default new UtilsController();
