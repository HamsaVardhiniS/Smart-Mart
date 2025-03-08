const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ Middleware for CORS Handling
router.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// ✅ Authentication Routes
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/verify-auth", authController.verifyAuth);

module.exports = router;
