const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const token = req.cookies.auth_token || req.header("Authorization");

    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret";
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;  

        if (req.originalUrl.includes("/admin") && decoded.role !== "Admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = authenticateUser;
