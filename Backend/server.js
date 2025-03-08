require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./config/db");

// Import route files
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const cashierRoutes = require("./routes/cashierRoutes");
const hrRoutes = require("./routes/hrRoutes");
const businessHeadRoutes = require("./routes/businessHeadRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ Admin Routes
const orderRoutes = require("./routes/orderRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const errorHandler = require("./middleware/errorMiddleware");

// Middleware setup
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);

// Register routes
app.use("/auth", authRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/cashier", cashierRoutes);
app.use("/hr", hrRoutes);
app.use("/business-head", businessHeadRoutes);
app.use("/api/admin", adminRoutes); // ✅ FIXED - Added "/api" prefix
app.use("/order", orderRoutes);
app.use("/supplier", supplierRoutes);

// Admin functionality - Database Health Check
app.get("/api/admin/db-health", async (req, res) => { // ✅ FIXED - Now part of "/api/admin"
    try {
        await db.query("SELECT 1");
        res.json({ status: "Database connected successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

// Admin functionality - Dashboard Stats
app.get("/api/admin/dashboard", async (req, res) => { // ✅ FIXED - Now part of "/api/admin"
    try {
        const [rows] = await db.query("SELECT COUNT(*) AS totalEmployees FROM employees");
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
