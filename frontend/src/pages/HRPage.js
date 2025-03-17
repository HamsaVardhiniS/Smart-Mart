import React, { useState, useEffect } from "react";
import { Navigate, NavLink, Routes, Route } from "react-router-dom";
import Employees from "../../src/components/HR/Employees";
import ShiftsAttendance from "../../src/components/HR/ShiftsAttendance";
import LeaveManagement from "../../src/components/HR/LeaveManagement";
import Payroll from "../../src/components/HR/Payroll";
import Reports from "../../src/components/HR/Reports";
import HRDashboard from "../../src/components/HR/Dashboard"; // Import the Dashboard Component
import "../css/HRPage.css";

const HRPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hr-container">
            {/* Sidebar Navigation */}
            <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
                <h2>HR Dashboard</h2>
                <ul>
                    <li><NavLink to="/hr">🏠 Dashboard</NavLink></li>  {/* ✅ Added Dashboard Link */}
                    <li><NavLink to="/hr/employees">👥 Employees</NavLink></li>
                    <li><NavLink to="/hr/shifts-attendance">📆 Shifts & Attendance</NavLink></li>
                    <li><NavLink to="/hr/leave-management">🏖️ Leave Management</NavLink></li>
                    <li><NavLink to="/hr/payroll">💰 Payroll & Salary</NavLink></li>
                    <li><NavLink to="/hr/reports">📊 Reports & Insights</NavLink></li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="hr-main-content">
                <header className="hr-header">
                    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                    <h1>HR Management Dashboard</h1>
                    <span className="current-time">{currentTime.toLocaleTimeString()}</span>
                    <div className="hr-profile">
                        <span>HR Manager</span>
                        <button className="logout-btn">Logout</button>
                    </div>
                </header>

                {/* Routing for Different Sections */}
                <Routes>
                    <Route path="/" element={<Navigate to="/hr" />} /> {/* Redirect /hr to HR Dashboard */}
                    <Route path="/hr" element={<HRDashboard />} />  {/* ✅ Dashboard Route */}
                    <Route path="employees" element={<Employees />} />
                    <Route path="shifts-attendance" element={<ShiftsAttendance />} />
                    <Route path="leave-management" element={<LeaveManagement />} />
                    <Route path="payroll" element={<Payroll />} />
                    <Route path="reports" element={<Reports />} />
                </Routes>

                {/* Footer Section */}
                <footer className="hr-footer">
                    <p>&copy; 2025 Hypermarket Solutions. All rights reserved.</p>
                    <p><NavLink to="/support">Support</NavLink> | <NavLink to="/policy">Privacy Policy</NavLink></p>
                </footer>
            </div>
        </div>
    );
};

export default HRPage;
