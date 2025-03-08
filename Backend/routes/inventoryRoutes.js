const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// Routes for products
router.get("/products", inventoryController.getAllProducts);
router.get("/products/search", inventoryController.searchProducts);
router.put("/products/:product_id", inventoryController.updateProduct);

// Routes for supplier orders
router.get("/supplier-orders", inventoryController.getSupplierOrders);
router.get("/suppliers", inventoryController.getAllSuppliers); // Fetch all suppliers (also supports search)
router.post("/suppliers", inventoryController.createSupplier); // Create a supplier
router.put("/suppliers/:supplier_id", inventoryController.updateSupplier); 
// Routes for inventory batches
router.get("/inventory-batches", inventoryController.getInventoryBatches);

// Routes for sales transactions
router.get("/sales-transactions", inventoryController.getSalesTransactions);

module.exports = router;
