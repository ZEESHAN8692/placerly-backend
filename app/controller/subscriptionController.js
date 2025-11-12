import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
import { UserSubscriptionModel } from "../models/subscriptionModel.js";
import { PricingModel } from "../models/pricingModel.js";
import { UserModel } from "../models/userModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class UserSubscriptionController {
  /**
   * STEP 1: Create Stripe Checkout Session
   */
  async createCheckoutSession(req, res) {
    try {
      const { planId, userId } = req.body;

      if (!planId || !userId) {
        return res.status(400).json({ message: "Plan ID and User ID are required" });
      }

      const plan = await PricingModel.findById(planId);
      if (!plan) return res.status(404).json({ message: "Plan not found" });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.planName,
                description: plan.description,
              },
              unit_amount: Math.round(plan.price * 100), 
            },
            quantity: 1,
          },
        ],
        metadata: { planId, userId },
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("Stripe Session Error:", err);
      res.status(500).json({ message: "Error creating checkout session" });
    }
  }

  async verifyPayment(req, res) {
    try {
      const { session_id } = req.query;
      if (!session_id) return res.status(400).json({ message: "Session ID required" });

     
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment not verified" });
      }

      const { planId, userId } = session.metadata;

      // ✅ Find plan details
      const plan = await PricingModel.findById(planId);
      if (!plan) return res.status(404).json({ message: "Plan not found" });

      // ✅ Set subscription start & end dates
      const startDate = new Date();
      const endDate = new Date();

      // Example: if plan has duration (in months)
      if (plan.durationMonths) {
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);
      } else {
        endDate.setMonth(endDate.getMonth() + 1); // fallback: 1 month
      }

      // ✅ Prevent duplicate subscriptions for same payment
      const existing = await UserSubscriptionModel.findOne({ paymentId: session.payment_intent });
      if (existing) {
        return res.status(200).json({ message: "Payment already verified", data: existing });
      }

      // ✅ Create subscription record
      const subscription = await UserSubscriptionModel.create({
        userId,
        planId,
        paymentId: session.payment_intent,
        amountPaid: plan.price,
        currency: session.currency?.toUpperCase() || "USD",
        startDate,
        endDate,
        status: "active",
      });

      // ✅ Update user profile
      await UserModel.findByIdAndUpdate(userId, {
        activePlan: plan.planName,
        subscriptionStatus: "active",
        subscriptionEnd: endDate,
      });

      res.status(200).json({
        message: "Payment verified and subscription activated successfully",
        data: subscription,
      });
    } catch (err) {
      console.error("Verify Payment Error:", err);
      res.status(500).json({ message: "Error verifying payment" });
    }
  }


  async getUserSubscription(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: "User ID required" });

      const subs = await UserSubscriptionModel.find({ userId })
        .populate("planId")
        .sort({ createdAt: -1 });

      res.status(200).json({ data: subs });
    } catch (err) {
      console.error("Get User Subscription Error:", err);
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  }
}

export default new UserSubscriptionController();
