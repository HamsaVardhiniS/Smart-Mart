const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const token = req.cookies.auth_token || req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Session expired. Please log in again.", redirect: "/login" });
    }

    try {
        const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret";
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;

        if (req.originalUrl.includes("/admin") && decoded.role !== "Admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        next();
    } catch (err) {
        // ✅ Forcefully logout user if token is invalid or expired
        res.clearCookie("auth_token");
        return res.status(401).json({ error: "Session expired. Please log in again.", redirect: "/login" });
    }
};


module.exports = authenticateUser;
