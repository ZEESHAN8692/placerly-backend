import mongoose from "mongoose";
import Joi from "joi";

const executorValidation = Joi.object({
  userId: Joi.string().required(), // jis user ne executor assign kiya
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  contactNumber: Joi.string().optional(),
  status: Joi.string().valid("pending", "approved", "revoked").default("pending"),
  requestToken: Joi.string().optional(),
  executorUserId: Joi.string().optional(),
});


const executorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String },

    status: { type: String, enum: ["pending", "approved", "revoked"], default: "pending" },
    executorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    requestToken: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ExecutorModel = mongoose.model("Executor", executorSchema);
export { ExecutorModel, executorValidation };
