const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// ✅ Fetch all orders
router.get("/", orderController.getAllOrders);

// ✅ Create a new order
router.post("/", orderController.createOrder);

// ✅ (Optional) Update order status
router.put("/:order_id/status", orderController.updateOrderStatus);

// ✅ (Optional) Delete an order
router.delete("/:order_id", orderController.deleteOrder);

module.exports = router;
