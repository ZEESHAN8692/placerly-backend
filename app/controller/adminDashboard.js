import { UserModel } from "../models/userModel.js";
import { UserSubscriptionModel } from "../models/subscriptionModel.js";
import { BlogModel } from "../models/blogModel.js";

class AdminDashboardController {
    async adminDashboard(req, res) {
        try {
            const usersCount = await UserModel.countDocuments({ role: "user" ,status : "active"});
            const subscriptionsCount = await UserSubscriptionModel.countDocuments({ status: "active" });
            const blogsCount = await BlogModel.countDocuments({});
            res.status(200).json({
                status: "success",
                users: usersCount,
                subscriptions: subscriptionsCount,
                blogs : blogsCount
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new AdminDashboardController();