import { FaQModel , faqSchemaJoi } from "../models/faqModel.js";

class FAQController {
    async createFaq(req , res){
        try {

            const faq = new FaQModel(req.body);
            await faq.save();
            res.status(201).json({ message: "FAQ created successfully", faq });
        } catch (error) {
            res.status(500).json({ message: "Error creating FAQ", error: error.message });
        }
    }

    async getFaq(req , res){
        try {
            const faq = await FaQModel.findById(req.params.id);
            if (!faq) return res.status(404).json({ message: "FAQ not found" });
            res.json(faq);
        } catch (error) {
            res.status(500).json({ message: "Error fetching FAQ", error: error.message });
        }
    }

    async getFaqs(req , res){
        try {
            const faqs = await FaQModel.find();
            res.json(faqs);
        } catch (error) {
            res.status(500).json({ message: "Error fetching FAQs", error: error.message });
        }
    }

    async updateFaq(req , res){
        try {
            const { error } = faqSchemaJoi.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const faq = await FaQModel.findById(req.params.id);
            if (!faq) return res.status(404).json({ message: "FAQ not found" });

            faq.question = req.body.question ?? faq.question;
            faq.answer = req.body.answer ?? faq.answer;
            faq.updatedAt = Date.now();

            await faq.save();

            res.json({ message: "FAQ updated successfully", faq });
        } catch (error) {
            res.status(500).json({ message: "Error updating FAQ", error: error.message });
        }
    }

    async deleteFaq(req , res){
        try {
            const faq = await FaQModel.findById(req.params.id);
            if (!faq) return res.status(404).json({ message: "FAQ not found" });

            await FaQModel.findByIdAndDelete(req.params.id);

            res.json({ message: "FAQ deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting FAQ", error: error.message });
        }
    }

}

export default new FAQController();