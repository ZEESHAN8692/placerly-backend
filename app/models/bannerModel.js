import mongoose from 'mongoose';
import Joi from 'joi';
const bannerValidation = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(3).max(300),
    imageUrl: Joi.string().uri().optional(),
    link: Joi.string(),
    isActive: Joi.boolean().default(true)
});

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,

    },
    description: {
        type: String,

    },
    imageUrl: {
        type: String,
        required: true,

    },
    link: {
        type: String,

    },

    isActive: {
        type: Boolean,
        default: true
    },
    public_id: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const BannerModel = mongoose.model('Banner', bannerSchema);

export {
    BannerModel,
    bannerValidation
}


