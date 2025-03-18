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

// Update order status (admin only)
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { is_complete } = req.body;

    if (typeof is_complete !== "boolean") {
      return res.status(400).json({ error: "is_complete must be a boolean" });
    }

    const order = await orderService.updateOrderStatus(orderId, is_complete);

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
