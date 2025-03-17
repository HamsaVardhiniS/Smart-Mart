import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure you have styles

const departmentRoutes = {
    "Human Resources": "/hr",
    "Business Development": "/business-head",
    "Inventory & Supply Chain Management": "/inventory",
    "Customer Billing": "/cashier",
    "Admin": "/admin"
};

const LoginPage = ({ onLogin }) => {
    console.log("LoginPage Loaded");
    const [employee_id, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
    
        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ employee_id, password })
            });
    
            const data = await response.json();
    
            if (response.ok && data.employee) {
                onLogin(data.employee);
                const redirectPath = departmentRoutes[data.employee.department];
                if (redirectPath) {
                    navigate(redirectPath);
                } else {
                    setError("Invalid department. Contact admin.");
                }
            } else {
                setError(data.error || "Login failed. Please try again.");
            }
        } catch (error) {
            setError("Server error. Please try again later.");
        }
    };
    
    // Ensure users are redirected to login if session is expired
    useEffect(() => {
        if (window.location.pathname === "/login") return; // Prevent redirect loop
    
        fetch("http://localhost:5000/auth/verify-auth", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const redirectPath = departmentRoutes[data.employee.department] || "/dashboard";
                    navigate(redirectPath);
                }
            })
            .catch(() => console.log("Session expired or no active session."));
    }, []);

    return (
        <div className="login-page">
            {/* Header */}
            <header className="header">
                <h1 className="store-name">SmartMart</h1>
                <p className="tagline">Smarter Automation for Seamless Retail!</p>
            </header>

            <div className="login-container">
                {/* Left Side (Image) */}
                <div className="login-image">
                    {/* Image will be set in CSS */}
                </div>

                {/* Right Side (Login Box) */}
                <div className="login-box">
                    <h2>Employee Login</h2>
                    {error && <p className="error-text">{error}</p>}
                    <form onSubmit={handleLogin}>
                        <input
                            type="number"
                            placeholder="Employee ID"
                            value={employee_id}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <p>📍 Mission Street, Coimbatore | 📞 9442XXX456 | ✉ contactus@smartmart.com</p>
                <p>© 2025 SmartMart. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default LoginPage;
