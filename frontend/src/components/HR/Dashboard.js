import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [data, setData] = useState({
        totalEmployees: 0,
        activeToday: 0,
        onLeaveToday: 0,
        upcomingShifts: [],
        pendingPayroll: 0,
        weeklyAttendance: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employees, active, leave, shifts, payroll, attendance] = await Promise.all([
                    fetch("http://localhost:5000/api/hr/employees/count").then(res => res.json()),
                    fetch("http://localhost:5000/api/hr/employees/active/today").then(res => res.json()),
                    fetch("http://localhost:5000/api/hr/leaves/today").then(res => res.json()),
                    fetch("http://localhost:5000/api/hr/shifts/upcoming").then(res => res.json()),
                    fetch("http://localhost:5000/api/hr/payroll/pending").then(res => res.json()),
                    fetch("http://localhost:5000/api/hr/attendance/weekly").then(res => res.json()),
                ]);

                setData({
                    totalEmployees: employees.count,
                    activeToday: active.count,
                    onLeaveToday: leave.count,
                    upcomingShifts: shifts,
                    pendingPayroll: payroll.count,
                    weeklyAttendance: attendance,
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="dashboard-container">
            <h2>HR Dashboard</h2>
            <div className="stats-cards">
                <div className="card">👥 Total Employees: {data.totalEmployees}</div>
                <div className="card">✅ Active Today: {data.activeToday}</div>
                <div className="card">🏖️ On Leave Today: {data.onLeaveToday}</div>
                <div className="card">📆 Pending Payroll: {data.pendingPayroll}</div>
            </div>

            <h3>Upcoming Shifts</h3>
            <ul>
                {data.upcomingShifts.map((shift, index) => (
                    <li key={index}>{shift.employee} - {shift.shift_time}</li>
                ))}
            </ul>

            <h3>Weekly Attendance Trends</h3>
            <div className="chart-container">
                {/* Replace with a chart component if needed */}
                {data.weeklyAttendance.map((day, index) => (
                    <div key={index} className="bar" style={{ height: `${day.percentage}%` }}>
                        {day.day}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
