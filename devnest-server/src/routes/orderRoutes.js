import express from "express";
import { createCheckoutSession } from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { stripeWebhook } from "../controllers/orderController.js";



const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/webhook", stripeWebhook);

export default router;