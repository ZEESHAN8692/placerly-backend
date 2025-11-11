import mongoose from "mongoose";
import Joi from "joi";

const bankingValidation = Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().required(),
    accountName: Joi.string().optional(),
    accountNumber: Joi.string().optional(),
    balance: Joi.number().min(0)
});


const bankingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    accountName: { type: String },
    accountNumber: { type: String },
    balance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


const BankingModel = mongoose.model('Banking', bankingSchema);

export { BankingModel , bankingValidation };
