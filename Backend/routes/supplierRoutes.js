const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

router.get("/suppliers", supplierController.getAllSuppliers);
router.post("/suppliers", supplierController.addSupplier);

module.exports = router;
