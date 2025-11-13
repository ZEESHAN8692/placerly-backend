import mongoose from "mongoose";
import Joi from "joi";

const enquiryValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
});

const EnquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EnquiryModel = mongoose.model("Enquiry", EnquirySchema);
export { EnquiryModel, enquiryValidation };
