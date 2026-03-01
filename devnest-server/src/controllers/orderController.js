import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "../config/stripe.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.stock < quantity)
      return res.status(400).json({ message: "Insufficient stock" });

    if (product.stock <= 0) {
  return res.status(400).json({ message: "Product out of stock" });
}

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100, // cents
          },
          quantity,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    // Create order in DB (pending)
    const order = await Order.create({
      user: req.user.id,
      products: [
        {
          product: product._id,
          quantity,
          priceAtPurchase: product.price,
        },
      ],
      totalAmount: product.price * quantity,
      stripeSessionId: session.id,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed.");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const order = await Order.findOne({
      stripeSessionId: session.id,
    });

    if (order) {
      order.paymentStatus = "paid";
      await order.save();

      // Reduce stock
      for (let item of order.products) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save();
      }
    }
  }

  res.json({ received: true });
};