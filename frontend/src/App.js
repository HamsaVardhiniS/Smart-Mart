import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import InventoryPage from "./pages/InventoryPage";
import CashierPage from "./pages/CashierPage";
import HRPage from "./pages/HRPage";
import BusinessHeadPage from "./pages/BusinessHeadPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

// Matches database department names exactly
const departmentRoutes = {
    "Human Resources": "/hr",
    "Business Development": "/business-head",
    "Inventory & Supply Chain Management": "/inventory",
    "Customer Billing": "/cashier",
    "Admin": "/admin",
};

function App() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (user && !departmentRoutes[user.department]) {
            handleLogout();
        }
    }, [user]);

    const handleLogin = (employee) => {
        if (employee?.department && departmentRoutes[employee.department]) {
            setUser(employee);
            localStorage.setItem("user", JSON.stringify(employee));

            navigate(departmentRoutes[employee.department]);
        } else {
            console.error("Invalid department or missing department data.");
        }
    };

    const handleLogout = async () => {
        if (!user) return; // Prevent unnecessary API calls

        try {
            await fetch("http://localhost:5000/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed", error);
        }

        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="App">
            <Routes>
                {/* If no user, always go to login */}
                {!user ? (
                    <>
                        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : (
                    <>
                        <Route path="/" element={<Navigate replace to={departmentRoutes[user.department]} />} />
                        <Route path="/inventory" element={user.department === "Inventory & Supply Chain Management" ? <InventoryPage /> : <Navigate to="/" />} />
                        <Route path="/cashier" element={user.department === "Customer Billing" ? <CashierPage /> : <Navigate to="/" />} />
                        <Route path="/hr" element={user.department === "Human Resources" ? <HRPage /> : <Navigate to="/" />} />
                        <Route path="/business-head" element={user.department === "Business Development" ? <BusinessHeadPage /> : <Navigate to="/" />} />
                        <Route path="/admin" element={user.department === "Admin" ? <AdminPage /> : <Navigate to="/" />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                )}
            </Routes>

            {user && (
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            )}
        </div>
    );
}

export default App;
