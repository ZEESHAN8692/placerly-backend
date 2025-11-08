import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
import { UserSubscriptionModel, UserSubscriptionValidation } from "../models/subscriptionModel.js";
import { PricingModel } from "../models/pricingModel.js";
import { UserModel } from "../models/userModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class UserSubscriptionController {
  // 🟢 STEP 1: Create Checkout Session
  async createCheckoutSession(req, res) {
    try {
      const { planId, userId } = req.body;

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
              unit_amount: Math.round(plan.price * 100), // USD in cents
            },
            quantity: 1,
          },
        ],
        metadata: { planId, userId },
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("Stripe Session Error:", err);
      res.status(500).json({ message: "Error creating checkout session" });
    }
  }

  // 🟡 STEP 2: Verify Payment and Save Subscription
  async verifyPayment(req, res) {
    try {
      const { session_id } = req.query;

      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (!session || session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment not verified" });
      }

      const { planId, userId } = session.metadata;
      const plan = await PricingModel.findById(planId);
      if (!plan) return res.status(404).json({ message: "Plan not found" });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // assuming 1-month duration

      const subscription = await UserSubscriptionModel.create({
        userId,
        planId,
        paymentId: session.payment_intent,
        amountPaid: plan.price,
        currency: "USD",
        startDate,
        endDate,
        status: "active",
      });

      // 🔁 Update user model with active plan info
      await UserModel.findByIdAndUpdate(userId, {
        activePlan: plan.planName,
        subscriptionStatus: "active",
        subscriptionEnd: endDate,
      });

      res.status(200).json({
        message: "Payment verified and subscription activated",
        data: subscription,
      });
    } catch (err) {
      console.error("Verify Payment Error:", err);
      res.status(500).json({ message: "Error verifying payment" });
    }
  }

  // 🔵 STEP 3: Get user subscription details
  async getUserSubscription(req, res) {
    try {
      const { userId } = req.params;
      const subs = await UserSubscriptionModel.find({ userId })
        .populate("planId")
        .sort({ createdAt: -1 });

      res.status(200).json({ data: subs });
    } catch (err) {
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  }
}

export default new UserSubscriptionController();
