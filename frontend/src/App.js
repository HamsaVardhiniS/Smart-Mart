import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import InventoryPage from "./pages/InventoryPage";
import CashierPage from "./pages/CashierPage";
import HRPage from "./pages/HRPage";
import BusinessHeadPage from "./pages/BusinessHeadPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

const departmentRoutes = {
    "Human Resources": "/hr",
    "Business Development": "/business-head",
    "Inventory & Supply Chain Management": "/inventory",
    "Customer Billing": "/cashier",
    "Admin": "/admin",
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch("http://localhost:5000/auth/verify-auth", {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();
                if (data.success && data.employee) {
                    setUser(data.employee);
                    localStorage.setItem("user", JSON.stringify(data.employee));
                } else {
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth verification failed:", error);
                localStorage.removeItem("user");
                setUser(null);
            }
            setLoading(false);
        };

        verifyAuth();
    }, []);

    const handleLogin = (employee) => {
        if (employee?.department && departmentRoutes[employee.department]) {
            setUser(employee);
            localStorage.setItem("user", JSON.stringify(employee));
            navigate(departmentRoutes[employee.department]);
        } else {
            console.error("Invalid department or missing department data.");
        }
    };

    const handleLogout = () => {
        fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" })
            .then(() => {
                setUser(null);
                localStorage.removeItem("user");
                navigate("/login");
            })
            .catch((error) => console.error("Logout failed:", error));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="App">
            <Routes>
                {!user ? (
                    <>
                        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : (
                    <>
                        <Route path="/" element={<Navigate replace to={departmentRoutes[user.department]} />} />
                        <Route path="/inventory/*" element={<InventoryPage />} />
                        <Route path="/cashier/*" element={<CashierPage />} />
                        <Route path="/hr/*" element={<HRPage />} />
                        <Route path="/business-head/*" element={<BusinessHeadPage />} />
                        <Route path="/admin/*" element={<AdminPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                )}
            </Routes>
        </div>
    );
}

export default App;
