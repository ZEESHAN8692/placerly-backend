import Joi from "joi";
import mongoose from "mongoose";

const userValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.number().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
});


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    role: { type: String, enum: ["user", "admin","executor"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isVerified: { type: Boolean, default: false },

    // Subscription Info
    subscription: {
        planId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
        planName: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        status: { type: String, enum: ["active", "expired", "pending"], default: "pending" },
    },


    // link with transitions
    transitions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Executor",
            unique: true
        }
    ],

    accessToken: { type: String },
    refreshToken: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


const UserModel = mongoose.model("User", userSchema);

export {
    UserModel,
    userValidation
}