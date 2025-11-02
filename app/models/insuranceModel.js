import mongoose from 'mongoose';
import Joi from 'joi';


const insuranceValidation = Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('life', 'home').required(),
    provider: Joi.string().min(3).max(100).required(),
    policyNumber: Joi.string().min(3).max(50).required(),
    expiryDate: Joi.date().optional(),
    coverageAmount: Joi.number().min(0),
    premium: Joi.number().min(0),
    renewalDate: Joi.date().optional()
});


const insuranceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['life', 'home'], required: true },
    provider: { type: String, required: true }, // ex: Aviva, Admiral
    policyNumber: { type: String, required: true },
    expiryDate: { type: Date },
    coverageAmount: {
        type: Number,
    },
    premium: {
        type: Number,
    },
    renewalDate: {
        type: Date,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const InsuranceModel = mongoose.model('Insurance', insuranceSchema);
export { InsuranceModel, insuranceValidation };
