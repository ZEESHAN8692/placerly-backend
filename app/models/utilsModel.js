import mongoose from "mongoose";
import Joi from "joi";


const utilsValidation = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().required(),
  name: Joi.string().min(3).max(100).required(),
  accountNumber: Joi.string().min(3).max(50).required(),
  billingCycle: Joi.string().optional(),
  outstandingBill: Joi.number().min(0),
});

const utilsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  name: { type: String, required: true }, // ex: British Gas, Affinity Water
  accountNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
   billingCycle: {
      type: String,
    },
    outstandingBill: {
      type: Number,
    },
});


const UtilsModel = mongoose.model('Utils', utilsSchema);
export { UtilsModel, utilsValidation };
