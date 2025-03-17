import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState({ id: '', name: '', department: '' });
    const [showProfile, setShowProfile] = useState(false);
    const [profileData, setProfileData] = useState({});
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        first_name: '', last_name: '', role: 'Cashier', department_id: '',
        phone: '', email: '', address: '', dob: '', gender: 'Male',
        emergency_contact: '', hire_date: '', preferred_shifts: 'Morning',
        bank_account_number: '', bank_name: '', ifsc_code: '', account_holder_name: '',
        salary: '', salary_mode: 'Bank Transfer'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/hr/employees');
            setEmployees(Array.isArray(response.data) ? response.data.flat() : []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleSearch = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const filteredEmployees = employees.filter(emp =>
        (search.id ? String(emp.employee_id).includes(search.id) : true) &&
        (search.name ? emp.first_name?.toLowerCase().includes(search.name.toLowerCase()) : true) &&
        (search.department ? String(emp.department_id) === search.department : true)
    );

    const handleEditClick = (employee) => {
        setEditingEmployee(employee);
        setShowEditModal(true);
    };

    const handleUpdateEmployee = async () => {
        try {
            await axios.put(`/api/employees/${editingEmployee.employee_id}`, editingEmployee);
            fetchEmployees();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const handleViewProfile = async (employee) => {
        setShowProfile(true);
        try {
            const [shifts, attendance, payroll] = await Promise.all([
                axios.get(`/api/employees/${employee.employee_id}/shifts`),
                axios.get(`/api/employees/${employee.employee_id}/attendance`),
                axios.get(`/api/employees/${employee.employee_id}/payroll`)
            ]);
            setProfileData({ employee, shifts: shifts.data, attendance: attendance.data, payroll: payroll.data });
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    const handleDeactivate = async (employee) => {
        try {
            await axios.put(`/api/employees/${employee.employee_id}/deactivate`);
            console.log(`Employee ${employee.employee_id} deactivated successfully.`);
        } catch (error) {
            console.error('Error deactivating employee:', error);
        }
    };
    

    return (
        <div className="employee-container">
            <h2>Employee Management</h2>
            <div>
                <input type="text" name="id" placeholder="Search by ID" value={search.id} onChange={handleSearch} />
                <input type="text" name="name" placeholder="Search by Name" value={search.name} onChange={handleSearch} />
                <select name="department" value={search.department} onChange={handleSearch}>
                    <option value="">All Departments</option>
                    <option value="1">Human Resources</option>
                    <option value="3">Inventory & Supply Chain</option>
                    <option value="4">Customer Billing</option>
                    <option value="6">Business Development</option>
                </select>
            </div>
            <button onClick={() => setShowAddModal(true)}>🟢 Add Employee</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    {filteredEmployees.map(emp => (
        emp && emp.first_name ? (
            <tr key={emp.employee_id}>
                <td>{emp.employee_id}</td>
                <td>{emp.first_name} {emp.last_name}</td>
                <td>{emp.department_id}</td>
                <td>{emp.role}</td>
                <td>{emp.phone}</td>
                <td>{emp.status}</td>
                <td>
                    <button onClick={() => handleEditClick(emp)}>✏️ Edit</button>
                    <button onClick={() => handleViewProfile(emp)}>📋 View Profile</button>
                    <button onClick={() => handleDeactivate(emp)}>❌Deactivate Employee</button>
                </td>
            </tr>
        ) : (
            <tr key={emp?.employee_id || 'unknown'}>
                <td colSpan="7">Invalid data</td>
            </tr>
        )
    ))}
</tbody>


            </table>

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit Employee</h3>
                        <input type="text" value={editingEmployee?.first_name} onChange={(e) => setEditingEmployee({ ...editingEmployee, first_name: e.target.value })} placeholder="First Name" />
                        <input type="text" value={editingEmployee?.last_name} onChange={(e) => setEditingEmployee({ ...editingEmployee, last_name: e.target.value })} placeholder="Last Name" />
                        <input type="text" value={editingEmployee?.phone} onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })} placeholder="Phone" />
                        <button onClick={handleUpdateEmployee}>Update</button>
                        <button onClick={() => setShowEditModal(false)}>Close</button>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add Employee</h3>
                        <input type="text" placeholder="First Name" onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })} />
                        <input type="text" placeholder="Last Name" onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })} />
                        <input type="text" placeholder="Phone" onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} />
                        <button onClick={() => setShowAddModal(false)}>Close</button>
                    </div>
                </div>
            )}

            {showProfile && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Profile: {profileData.employee.first_name} {profileData.employee.last_name}</h3>
                        <p>Phone: {profileData.employee.phone}</p>
                        <p>Email: {profileData.employee.email}</p>
                        <h4>Shift Schedule</h4>
                        <pre>{JSON.stringify(profileData.shifts, null, 2)}</pre>
                        <h4>Attendance History</h4>
                        <pre>{JSON.stringify(profileData.attendance, null, 2)}</pre>
                        <h4>Payroll History</h4>
                        <pre>{JSON.stringify(profileData.payroll, null, 2)}</pre>
                        <button onClick={() => setShowProfile(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
