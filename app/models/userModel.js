import Joi from "joi";
import mongoose from "mongoose";

const userValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.number().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
});


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


const UserModel = mongoose.model("User", userSchema);

export {
    UserModel , 
    userValidation
}