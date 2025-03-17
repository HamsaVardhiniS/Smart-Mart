import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveManagement = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newLeave, setNewLeave] = useState({
        employee_id: "",
        leave_type: "Sick Leave",
        start_date: "",
        end_date: "",
    });

    useEffect(() => {
        fetchLeaveRequests();
        fetchEmployees();
    }, []);

    // Fetch Pending Leave Requests
    const fetchLeaveRequests = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/hr/leave-requests");
            setLeaveRequests(res.data);
        } catch (error) {
            console.error("Error fetching leave requests:", error);
        }
    };

    // Fetch Employees (for HR/Admin to apply for others)
    const fetchEmployees = async () => {
        try {
            const res = await axios.get("/employees");
            setEmployees(res.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.trim() === "") {
            setFilteredEmployees([]);
        } else {
            setFilteredEmployees(
                employees.filter((emp) =>
                    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(term.toLowerCase())
                )
            );
        }
    };

    const selectEmployee = (employee) => {
        setNewLeave({ ...newLeave, employee_id: employee.employee_id });
        setSearchTerm(`${employee.first_name} ${employee.last_name}`); // Show selected name
        setFilteredEmployees([]); // Hide dropdown
    };

    // Approve Leave
    const approveLeave = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/hr/leave-requests/${id}/approve`);
            alert("Leave Approved Successfully! ✅");
            fetchLeaveRequests();  // Refresh after update
        } catch (error) {
            console.error("Error approving leave:", error);
            alert("Error approving leave!");
        }
    };
    
    const rejectLeave = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/hr/leave-requests/${id}/reject`);
            alert("Leave Rejected Successfully! ❌");
            fetchLeaveRequests();  // Refresh after update
        } catch (error) {
            console.error("Error rejecting leave:", error);
            alert("Error rejecting leave!");
        }
    };
    

    // Request Leave
    const handleLeaveRequest = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/hr/leave-requests", newLeave);
            alert("Leave request submitted!");
            setNewLeave({
                employee_id: "",
                leave_type: "Sick Leave",
                start_date: "",
                end_date: "",
                reason: "",
            });
            fetchLeaveRequests();
        } catch (error) {
            console.error("Error requesting leave:", error);
        }
    };

    return (
        <div>
            <h2> Leave Management</h2>

            {/* Pending Leave Requests Table */}
            <h3>Pending Leave Requests</h3>
            <table className="leave-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {leaveRequests.map((request) => (
    <tr key={request.leave_id}>
        <td>{request.first_name} {request.last_name}</td> {/* Show full name */}
        <td>{request.leave_type}</td>
        <td>{new Date(request.start_date).toLocaleDateString()} → {new Date(request.end_date).toLocaleDateString()}</td>
        <td>{request.status}</td>
        <td>
            <button onClick={() => approveLeave(request.leave_id)}>✅ Approve</button>
            <button onClick={() => rejectLeave(request.leave_id)}>❌ Reject</button>
        </td>
    </tr>
))}
                </tbody>
            </table>

           {/* Apply for Leave Form */}
           <h3>Request Leave</h3>
            <form onSubmit={handleLeaveRequest} className="leave-form">
                <label>Employee:</label>
                <input
                    type="text"
                    placeholder="Search Employee"
                    value={searchTerm}
                    onChange={handleSearch}
                    required
                />
                {/* Filtered Employee List */}
                {filteredEmployees.length > 0 && (
                    <ul className="dropdown">
                        {filteredEmployees.map((emp) => (
                            <li key={emp.employee_id} onClick={() => selectEmployee(emp)}>
                                {emp.first_name} {emp.last_name}
                            </li>
                        ))}
                    </ul>
                )}

                <label>Leave Type:</label>
                <select
                    value={newLeave.leave_type}
                    onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Paid Leave">Paid Leave</option>
                    <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                </select>

                <label>Start Date:</label>
                <input
                    type="date"
                    value={newLeave.start_date}
                    onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    required
                />

                <label>End Date:</label>
                <input
                    type="date"
                    value={newLeave.end_date}
                    onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    required
                />

                <button type="submit">📩 Submit Request</button>
            </form>
        </div>
    );
};

export default LeaveManagement;
