const express = require("express");
const router = express.Router();
const businessHeadController = require("../controllers/businessHeadController");
const authenticateUser = require("../middleware/authMiddleware"); // ✅ Import the middleware

router.get("/dashboard", authenticateUser, businessHeadController.getDashboard);

module.exports = router;
