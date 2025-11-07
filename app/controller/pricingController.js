import { PricingModel, PricingSchemaJoi } from "../models/pricingModel.js";

class PricingController {
    async createPricing(req, res) {
        try {
            const { error } = PricingSchemaJoi.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.message });
            }
            const pricingLength = await PricingModel.countDocuments();
            if (pricingLength >= 3) {
                return res.status(400).json({ message: "Maximum 3 pricings allowed" });
            }
            const { planName, description ,price , features } = req.body;   
            const pricing = new PricingModel({ planName, description ,price , features });
            await pricing.save();
            res.status(201).json(pricing);
        } catch (error) {
            res.status(500).json({ message: "Error creating pricing", error: error.message });
        }
    }

    async getPricings(req, res) {
        try {
            const pricings = await PricingModel.find();
            res.json(pricings);
        } catch (error) {
            res.status(500).json({ message: "Error fetching pricings", error: error.message });
        }
    }

    async getPricing(req, res) {
        try {
            const pricing = await PricingModel.findById(req.params.id);
            if (!pricing) {
                return res.status(404).json({ message: "Pricing not found" });
            }
            res.json(pricing);
        } catch (error) {
            res.status(500).json({ message: "Error fetching pricing", error: error.message });
        }
    }

    async updatePricing(req, res) {
        try {
            const { error } = PricingSchemaJoi.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.message });
            }
            const pricing = await PricingModel.findById(req.params.id);
            if (!pricing) {
                return res.status(404).json({ message: "Pricing not found" });
            }
            pricing.planName = req.body.planName ?? pricing.planName;
            pricing.description = req.body.description ?? pricing.description;
            pricing.price = req.body.price ?? pricing.price;
            pricing.features = req.body.features ?? pricing.features;
            await pricing.save();
            res.json(pricing);
        } catch (error) {
            res.status(500).json({ message: "Error updating pricing", error: error.message });
        }
    }

    async deletePricing(req, res) {
        try {
            const pricing = await PricingModel.findById(req.params.id);
            if (!pricing) {
                return res.status(404).json({ message: "Pricing not found" });
            }
            await PricingModel.findByIdAndDelete(req.params.id);
            res.json({ message: "Pricing deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting pricing", error: error.message });
        }
    }
}

export default new PricingController();