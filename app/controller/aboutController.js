import { AboutModel , AboutSchemaJoi } from "../models/aboutModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

class AboutController {
    async createAbout(req, res) {
        try {
            const { error } = AboutSchemaJoi.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const {title , descriptionOne , descriptionTwo , mission , values , status} = req.body;
            const result = await uploadOnCloudinary(req.file.path);
            const data ={
                title,
                descriptionOne,
                descriptionTwo,
                mission,
                values,
                status,
                image:result.secure_url,
                public_id:result.public_id
            }
            const about = await AboutModel.create(data);
            res.json(about);
        } catch (error) {
            res.status(500).json({ message: "Error creating about", error: error.message });
        }
    }

    async getAbout(req, res) {
        try {
            const about = await AboutModel.findOne();
            if (!about) {
                return res.status(404).json({ message: "About not found" });
            }
            res.json(about);
        } catch (error) {
            res.status(500).json({ message: "Error fetching about", error: error.message });
        }
    }

    async updateAbout(req, res) {
        try {
            const { error } = AboutSchemaJoi.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const {title , descriptionOne , descriptionTwo , mission , values , status} = req.body;
            const about = await AboutModel.findOne();

            if (!about) {
                return res.status(404).json({ message: "About not found" });
            }

            if (req.file) {
                if (about.public_id) {
                    await deleteFromCloudinary(about.public_id);
                }
                const result = await uploadOnCloudinary(req.file.path);
                about.image = result.secure_url;
                about.public_id = result.public_id;
            }

            about.title = title || about.title;
            about.descriptionOne = descriptionOne || about.descriptionOne;
            about.descriptionTwo = descriptionTwo || about.descriptionTwo;
            about.mission = mission || about.mission;
            about.values = values || about.values;
            about.status = status || about.status;

            await about.save();
            res.json(about);
        } catch (error) {
            res.status(500).json({ message: "Error updating about", error: error.message });
        }
    }

}