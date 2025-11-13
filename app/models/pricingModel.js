
import Joi from "joi";
import mongoose from "mongoose";

const PricingSchemaJoi = Joi.object({
  planName: Joi.string().min(5).max(15).required(),
  description: Joi.string().min(8).max(100).required(),
  price: Joi.number().required(),
  features: Joi.array().items(Joi.string()).optional(),
  type: Joi.string().required(),
});

const PricingSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    features: {
      type: [String],
    },
    type: {
      type: String,
    }
  },
  { timestamps: true }
);

const PricingModel = mongoose.model("pricing", PricingSchema);

export { PricingModel, PricingSchemaJoi };
