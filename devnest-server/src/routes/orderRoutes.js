import express from "express";
import {
  createCheckoutSession,
  getAdminStats,
  getUserOrders
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);

router.get("/admin/stats", protect, adminOnly, getAdminStats);

router.get("/my-orders", protect, getUserOrders);

export default router;