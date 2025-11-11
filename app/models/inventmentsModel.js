import mongoose from "mongoose";
import Joi from "joi";

const investmentValidation = Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    amount: Joi.number().min(0).required(),
    date: Joi.date().required(),
});

const InvestmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["pending", "active", "inactive"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const InvestmentModel = mongoose.model("Investment", InvestmentSchema);

export { InvestmentModel, investmentValidation };
