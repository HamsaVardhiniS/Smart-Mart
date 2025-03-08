import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

// ✅ Matches database department names exactly
const departmentRoutes = {
    "Human Resources": "/hr",
    "Business Development": "/business-head",
    "Inventory & Supply Chain Management": "/inventory",
    "Customer Billing": "/cashier",
    "Admin": "/admin"
};

const LoginPage = ({ onLogin }) => {
    const [employee_id, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError(""); // Clear previous errors

        try {
            console.log("Attempting login with Employee ID:", employee_id);
            
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ employee_id, password })
            });

            const data = await response.json();
            console.log("Login Response:", data);

            if (response.ok && data.employee) {
                onLogin(data.employee);
                
                const redirectPath = departmentRoutes[data.employee.department];
                if (redirectPath) {
                    console.log("Navigating to:", redirectPath);
                    navigate(redirectPath);
                } else {
                    console.error("Invalid department name received:", data.employee.department);
                    setError("Invalid department. Contact admin.");
                }
            } else {
                console.warn("Login failed:", data.error);
                setError(data.error || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Server error:", error);
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div className="login-container">
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
    );
};

export default LoginPage;
