const express = require("express");
const router = express.Router();
const cashierController = require("../controllers/cashierController");

router.post("/create-bill", cashierController.createBill);
router.get("/bill-history", cashierController.getBillHistory);
router.get("/stock", cashierController.getStockDetails);
router.post("/feedback", cashierController.storeFeedback);

module.exports = router;
