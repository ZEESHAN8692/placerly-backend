import mongoose from "mongoose";
import Joi from "joi";

const faqSchemaJoi = Joi.object({
  question: Joi.string().required(),
  secondaryImage: Joi.string().required(),
});

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);


const FaQModel = mongoose.model("faq", faqSchema);

export { FaQModel, faqSchemaJoi }

