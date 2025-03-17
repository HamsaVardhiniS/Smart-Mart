const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// ============================
// Product Management Routes
// ============================
router.post("/products", inventoryController.addProduct);
router.get("/products", inventoryController.getAllProducts);
router.get("/products/:product_id", inventoryController.getProductById);
router.put("/products/:product_id", inventoryController.updateProduct);
router.get("/products/search", inventoryController.searchProductByName);

// ============================
// Supplier Management Routes
// ============================
router.get("/suppliers", inventoryController.getAllSuppliers);
router.post("/suppliers", inventoryController.createSupplier);
router.put("/suppliers/:supplier_id", inventoryController.updateSupplier);
router.get("/suppliers/:supplier_id/orders", inventoryController.getAllOrdersBySupplier);

// ============================
// Supplier Order Management Routes
// ============================
router.post("/supplier-orders", inventoryController.placeSupplierOrder);
router.put("/supplier-orders/:invoice_number/status", inventoryController.updateOrderStatus);
router.delete("/supplier-orders/:invoice_number", inventoryController.cancelSupplierOrder);
router.get("/supplier-orders/:invoice_number/track", inventoryController.trackSupplierOrder);
router.get("/current-orders", inventoryController.getCurrentOrders);
router.get("/historical-orders", inventoryController.getHistoricalOrders);
router.get("/search-orders", inventoryController.searchOrders);
router.get('/supplier-orders/items/:invoice_number', inventoryController.getItemsFromInvoice);


// ============================
// Stock Management Routes
// ============================
router.get("/stock-alerts", inventoryController.getStockAlertProducts);

module.exports = router; // Ensure this is exporting `router`
