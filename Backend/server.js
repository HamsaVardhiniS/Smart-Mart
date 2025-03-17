require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./config/db");

const app = express();
app.use(cookieParser()); // ✅ Enables cookie parsing

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true, // ✅ Allows cookies from frontend
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);

// Import and register routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/cashier", require("./routes/cashierRoutes"));
app.use("/api/hr", require("./routes/hrRoutes"));
app.use("/api/business-head", require("./routes/businessHeadRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// ✅ Root API Check
app.get("/", (req, res) => {
    res.json({ message: "SmartMart Backend is running! 🚀" });
});

// Global Error Handling Middleware
app.use(require("./middleware/errorMiddleware"));

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
