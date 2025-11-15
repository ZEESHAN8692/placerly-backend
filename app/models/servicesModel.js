import mongoose, { Schema } from "mongoose";
import Joi from "joi";

// Joi validation schema for service
const ServiceSchemaJoi = Joi.object({
  title: Joi.string().min(15).max(30).required(),
  description: Joi.string().min(20).max(40).required(),
  url: Joi.string().uri().required(),
  image: Joi.string().optional(),
});


const ServiceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);


const ServiceModel = mongoose.model("service", ServiceSchema);

export { ServiceModel, ServiceSchemaJoi };
