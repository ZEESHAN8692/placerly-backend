
import mongoose from 'mongoose';
import Joi from 'joi';


const debtValidation = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid('creditCard', 'mortgage').required(),
  name: Joi.string().min(3).max(100).required(),
  accountName: Joi.string().optional(),
  accountNumber: Joi.string().optional(),
  amount: Joi.number().min(0),
  dueDate: Joi.date().optional()
});

const debtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['creditCard', 'mortgage'], required: true },
  name: { type: String, required: true },
  accountName: { type: String },
  accountNumber: { type: String },
  amount: { type: Number, default: 0 },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const DebtModel = mongoose.model('Debt', debtSchema);
export { DebtModel, debtValidation };
