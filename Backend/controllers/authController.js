const db = require("../config/db");  // ✅ Correct import
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Login Function
exports.login = async (req, res) => {
    try {
        const { employee_id, password } = req.body;

        if (!employee_id || !password) {
            return res.status(400).json({ error: "Employee ID and password are required" });
        }

        // Debugging: Log employee_id received
        console.log("Login Attempt for Employee ID:", employee_id);

        // Fetch employee details from database
        const [rows] = await db.query(`
            SELECT e.employee_id, e.first_name, e.role, e.status, e.password_hash, d.department_name 
            FROM employees e
            JOIN departments d ON e.department_id = d.department_id
            WHERE e.employee_id = ?
        `, [employee_id]);
        

        if (rows.length === 0) {
            console.log("Employee not found in DB for ID:", employee_id);
            return res.status(401).json({ error: "Employee not found" });
        }

        const employee = rows[0];

        if (employee.status !== "Active") {
            return res.status(403).json({ error: "Account is inactive. Contact HR." });
        }

        // Debugging: Check if password_hash exists
        console.log("Password Entered:", password);
        console.log("Password Hash from DB:", employee.password_hash);

        if (!employee.password_hash) {
            return res.status(500).json({ error: "No password set for this user. Contact admin." });
        }

        const isMatch = await bcrypt.compare(password, employee.password_hash);
        if (!isMatch) {
            console.log("Password mismatch for Employee ID:", employee_id);
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { employee_id: employee.employee_id, role: employee.role },
            process.env.SECRET_KEY || "your_secret_key",
            { expiresIn: "8h" }
        );

        // Set cookie with JWT token
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 8 * 60 * 60 * 1000,
        });

        res.json({ 
            success: true,
            message: "Login successful",
            employee: { 
                employee_id: employee.employee_id, 
                first_name: employee.first_name,
                role: employee.role,
                department: employee.department_name // ✅ Send department name
            }
        });
        

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
};

// ✅ Logout Function
exports.logout = async (req, res) => {
    try {
        res.clearCookie("auth_token");
        res.json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
};

// ✅ Verify Authentication Middleware
exports.verifyAuth = async (req, res) => {
    console.log("Cookies:", req.cookies); // ✅ Debugging
    console.log("Headers:", req.headers); // ✅ Check if frontend sends cookies

    if (!req.cookies || !req.cookies.auth_token) {
        return res.status(401).json({ error: "Unauthorized: No auth token" });
    }

    const token = req.cookies.auth_token;

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || "your_secret_key");
        res.json({ success: true, employee_id: decoded.employee_id, role: decoded.role });
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
