import { sendEnquiryMailToPlacerly, sendEnquiryMailToUser } from "../helper/sendEnquiryMail.js";
import { EnquiryModel, enquiryValidation } from "../models/enquiryModel.js";

class EnquiryController {
    async createEnquiry(req, res) {
        try {
            const { error } = enquiryValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const enquiry = await EnquiryModel.create({
                name: req.body.name,
                email: req.body.email,
                subject: req.body.subject,
                message: req.body.message
            });

            await sendEnquiryMailToPlacerly(enquiry);
            await sendEnquiryMailToUser(enquiry.email, enquiry);

            res.status(201).json({ message: "Enquiry created successfully", enquiry });
        } catch (error) {
            res.status(500).json({ message: "Error creating enquiry", error: error.message });
        }
    }

    async getAllEnquiries(req, res) {
        try {
            const enquiries = await EnquiryModel.find();
            res.json(enquiries);
        } catch (error) {
            res.status(500).json({ message: "Error fetching enquiries", error: error.message });
        }
    }

    async getEnquiryById(req, res) {
        try {
            const enquiry = await EnquiryModel.findById(req.params.id);
            if (!enquiry) {
                return res.status(404).json({ message: "Enquiry not found" });
            }
            res.json(enquiry);
        } catch (error) {
            res.status(500).json({ message: "Error fetching enquiry", error: error.message });
        }
    }

    async deleteEnquiry(req, res) {
        try {
            const enquiry = await EnquiryModel.findByIdAndDelete(req.params.id);
            if (!enquiry) {
                return res.status(404).json({ message: "Enquiry not found" });
            }
            res.json({ message: "Enquiry deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting enquiry", error: error.message });
        }
    }
}

export default new EnquiryController();