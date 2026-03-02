import dotenv from "dotenv";
dotenv.config();
import { stripeWebhook } from "./controllers/orderController.js";
import express from "express";
import mongoose from "mongoose";

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middlewares/authMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";



const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.post(
  "/api/orders/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
app.use(express.json());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes placeholder
app.get("/", (req, res) => {
  res.send("DevNest API Running");
});

app.use("/api/auth", authRoutes);
app.get("/api/test", protect, (req, res) => {
  res.json({ message: "Protected route working", user: req.user });
});
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));