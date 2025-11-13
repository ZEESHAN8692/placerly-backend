import mongoose from "mongoose";
import Joi from "joi";

const UserSubscriptionValidation = Joi.object({
  userId: Joi.string().required(),
  planId: Joi.string().required(),
  paymentId: Joi.string().required(),
  amountPaid: Joi.number().required(),
  currency: Joi.string().default("USD"),
  startDate: Joi.date().optional(),
  endDate: Joi.date().required(),
  status: Joi.string().valid("active", "expired", "cancelled", "pending").default("pending"),
  autoRenew: Joi.boolean().default(false),
  address: Joi.object().required(),

});

const UserSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pricing",
      required: true,
    },
    paymentId: {
      type: String, 
      required: true,
      unique: true, 
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    address: {
      type: {},
      required: true
      
    },
  },
  { timestamps: true }
);

const UserSubscriptionModel = mongoose.model("user_subscription", UserSubscriptionSchema);

export { UserSubscriptionModel, UserSubscriptionValidation };
