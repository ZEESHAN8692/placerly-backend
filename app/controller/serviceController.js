import { ServiceModel, ServiceSchemaJoi } from "../models/servicesModel.js";
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js";

class ServiceController {
    async createService(req, res) {
        try {
            const { error } = ServiceSchemaJoi.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const result = await uploadOnCloudinary(req.file.path);
            const data = {
                title: req.body.title,
                description: req.body.description,
                url: req.body.url,
                image: result.secure_url,
                public_id: result.public_id,
            }

            const service = await ServiceModel.create(data);
            res.json(service);
        } catch (error) {
            res.status(500).json({ message: "Error creating service", error: error.message });
        }
    }

    async getServices(req, res) {
        try {
            const services = await ServiceModel.find({});
            res.json(services);
        } catch (error) {
            res.status(500).json({ message: "Error fetching services", error: error.message });
        }
    }

    async getServiceById(req, res) {
        try {
            const service = await ServiceModel.findById(req.params.id);
            if (!service) return res.status(404).json({ message: "Service not found" });
            res.json(service);
        } catch (error) {
            res.status(500).json({ message: "Error fetching service", error: error.message });
        }
    }

    async updateService(req, res) {
        try {
            const { error } = ServiceSchemaJoi.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const service = await ServiceModel.findById(req.params.id);
            if (!service) return res.status(404).json({ message: "Service not found" });

            if (req.file) {
                if (service.public_id) {
                    await deleteFromCloudinary(service.public_id);
                }
                const result = await uploadOnCloudinary(req.file.path);
                service.image = result.secure_url;
                service.public_id = result.public_id;
            }

            service.title = req.body.title ?? service.title;
            service.description = req.body.description ?? service.description;
            service.url = req.body.url ?? service.url;
            service.updatedAt = Date.now();

            await service.save();

            res.json({ message: "Service updated", service });
        } catch (error) {
            res.status(500).json({ message: "Error updating service", error: error.message });
        }
    }

    async deleteService(req, res) {
        try {
            const service = await ServiceModel.findById(req.params.id);
            if (!service) return res.status(404).json({ message: "Service not found" });

            if (service.public_id) {
                await deleteFromCloudinary(service.public_id);
            }

            await ServiceModel.findByIdAndDelete(req.params.id);

            res.json({ message: "Service deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting service", error: error.message });
        }
    }
}

export default new ServiceController();