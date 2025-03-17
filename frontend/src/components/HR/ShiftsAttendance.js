import React, { useState, useEffect } from "react";
import axios from "axios";

const ShiftsAttendance = () => {
    const [shifts, setShifts] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [updatedShifts, setUpdatedShifts] = useState({});

    useEffect(() => {
        fetchShiftSchedules();
        fetchAttendanceReports();
    }, []);

    // Fetch Shift Schedules
    const fetchShiftSchedules = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/hr/shifts");
            setShifts(response.data);
        } catch (error) {
            console.error("Error fetching shifts:", error);
        }
    };

    // Fetch Attendance Reports
    const fetchAttendanceReports = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/hr/attendance");
            setAttendance(response.data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    // Handle Shift Change
    const handleShiftChange = (shiftId, newShiftType) => {
        setUpdatedShifts((prev) => ({
            ...prev,
            [shiftId]: newShiftType,
        }));
    };

    // Edit Shift Schedule
    const handleEditShift = async (shiftId) => {
        try {
            const newShiftType = updatedShifts[shiftId];
            if (!newShiftType) return;

            const updatedShift = { shift_type: newShiftType };

            await axios.put(`http://localhost:5000/api/hr/shifts/${shiftId}`, updatedShift);
            fetchShiftSchedules();
        } catch (error) {
            console.error("Error updating shift:", error);
        }
    };

    // Export Attendance Report
    const exportAttendanceReport = async (employeeId) => {
        const month = selectedMonth || new Date().toISOString().slice(0, 7);
        window.location.href = `http://localhost:5000/api/hr/attendance/${employeeId}/export?month=${month}`;
    };

    return (
        <div>
            <h2>📆 Shift & Attendance Management</h2>

            {/* Shift Schedules Table */}
            <h3>Shift Schedules</h3>
            <table className="shift-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {shifts.map((shift) => (
                        <tr key={shift.shift_id}>
                            <td>{shift.employee_name}</td>
                            <td>{new Date(shift.shift_date).toLocaleDateString()}</td>
                            <td>
                                <select
                                    value={updatedShifts[shift.shift_id] || shift.shift_type}
                                    onChange={(e) => handleShiftChange(shift.shift_id, e.target.value)}
                                >
                                    <option value="Morning">Morning</option>
                                    <option value="Night">Night</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => handleEditShift(shift.shift_id)}>💾 Save</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Attendance Filters */}
            <h3>Attendance Reports</h3>
            <div className="filters">
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Employee ID or Name"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                />
            </div>

            {/* Attendance Table */}
            <table className="attendance-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Month</th>
                        <th>Export</th>
                    </tr>
                </thead>
                <tbody>
                    {attendance
                        .filter((a) => a.date && a.date.includes(selectedMonth)) // Ensure `a.date` exists
                        .filter((a) =>
                            selectedEmployee
                                ? String(a.employee_id).includes(String(selectedEmployee)) ||
                                  a.employee_name.toLowerCase().includes(selectedEmployee.toLowerCase())
                                : true
                        )
                        .map((a) => (
                            <tr key={a.attendance_id}>
                                <td>{a.employee_id}</td>
                                <td>{a.employee_name}</td>
                                <td>{selectedMonth}</td>
                                <td>
                                    <button onClick={() => exportAttendanceReport(a.employee_id)}>📄 Export</button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShiftsAttendance;
