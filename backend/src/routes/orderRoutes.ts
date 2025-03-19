import express from "express";
import { orderService } from "../services/orderService";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Get all orders (admin only)
router.get("/", authenticateToken, async (req, res) => {
  console.log("Received request to GET /api/orders");
  try {
    console.log("Fetching orders from service...");
    const orders = await orderService.getAllOrders();
    console.log(`Successfully fetched ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get a single order with its seeds (admin only)
router.get("/:id", authenticateToken, async (req, res) => {
  console.log(`Received request to GET /api/orders/${req.params.id}`);
  try {
    const order = await orderService.getOrderById(parseInt(req.params.id));
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  }
});

// Create a new order
router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_address,
      seeds,
      include_donation,
      donation_amount,
    } = req.body;

    // Validate required fields
    if (
      !customer_name ||
      !customer_email ||
      !customer_address ||
      !seeds ||
      !seeds.length
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate seeds array
    if (
      !Array.isArray(seeds) ||
      seeds.some((seed) => !seed.seed_id || !seed.quantity)
    ) {
      return res.status(400).json({ error: "Invalid seeds data" });
    }

    // Validate donation amount if included
    if (include_donation && (!donation_amount || donation_amount <= 0)) {
      return res.status(400).json({ error: "Invalid donation amount" });
    }

    const order = await orderService.createOrder(
      customer_name,
      customer_email,
      customer_address,
      seeds,
      include_donation || false,
      donation_amount || 0
    );

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    if (
      error instanceof Error &&
      error.message.includes("Not enough seeds available")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order status (admin only)
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    // Validate status
    if (
      !status ||
      !["incomplete", "in_progress", "complete"].includes(status)
    ) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const order = await orderService.updateOrderStatus(orderId, status);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
