import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPage = () => {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [searchDept, setSearchDept] = useState("");
    const [searchEmp, setSearchEmp] = useState("");
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showEmpModal, setShowEmpModal] = useState(false);
    const [newDepartment, setNewDepartment] = useState({ department_name: "", manager_id: "" });
    const [newEmployee, setNewEmployee] = useState({
        first_name: "", last_name: "", role: "Cashier", department_id: "", phone: "", email: "",
        address: "", dob: "", gender: "Male", emergency_contact: "", hire_date: "",
        status: "Active", password_hash: "", bank_account_number: "", bank_name: "", ifsc_code: "",
        account_holder_name: "", salary: "", salary_mode: "Bank Transfer", preferred_shifts: "Morning", allowed_leaves: 12
    });

    useEffect(() => {
        fetchDepartments();
        fetchEmployees();
    }, []);

    const fetchDepartments = async () => {
        const res = await axios.get("http://localhost:5000/api/admin/departments");
        setDepartments(res.data);
    };

    const fetchEmployees = async () => {
        const res = await axios.get("http://localhost:5000/api/admin/employees");
        setEmployees(res.data);
    };

    const addDepartment = async () => {
        await axios.post("http://localhost:5000/api/admin/departments", newDepartment);
        setShowDeptModal(false);
        fetchDepartments();
    };

    const addEmployee = async () => {
        await axios.post("http://localhost:5000/api/admin/employees", newEmployee);
        setShowEmpModal(false);
        fetchEmployees();
    };

    const deleteDepartment = async (id) => {
        await axios.delete(`http://localhost:5000/api/admin/departments/${id}`);
        fetchDepartments();
    };

    const deleteEmployee = async (id) => {
        await axios.delete(`http://localhost:5000/api/admin/employees/${id}`);
        fetchEmployees();
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-blue-900 text-white p-5">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <ul className="mt-4">
                    <li className="p-2 cursor-pointer">Departments</li>
                    <li className="p-2 cursor-pointer">Employees</li>
                </ul>
            </div>

            <div className="w-3/4 p-5">
                <h2 className="text-2xl font-bold">Manage Departments</h2>
                <input type="text" placeholder="Search" className="border p-2" 
                    onChange={(e) => setSearchDept(e.target.value.toLowerCase())} />
                <button className="bg-blue-500 text-white px-4 py-2 ml-2" onClick={() => setShowDeptModal(true)}>+ Add Department</button>
                <table className="w-full border mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th>ID</th>
                            <th>Name</th>
                            <th>Manager ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.filter(d => d.department_name.toLowerCase().includes(searchDept) || d.department_id.toString().includes(searchDept))
                            .map((dept) => (
                                <tr key={dept.department_id} className="border">
                                    <td>{dept.department_id}</td>
                                    <td>{dept.department_name}</td>
                                    <td>{dept.manager_id}</td>
                                    <td><button onClick={() => deleteDepartment(dept.department_id)}>🗑️</button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                <h2 className="text-2xl font-bold mt-10">Manage Employees</h2>
                <input type="text" placeholder="Search" className="border p-2" 
                    onChange={(e) => setSearchEmp(e.target.value.toLowerCase())} />
                <button className="bg-blue-500 text-white px-4 py-2 ml-2" onClick={() => setShowEmpModal(true)}>+ Add Employee</button>
                <table className="w-full border mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th>ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.filter(e => e.first_name.toLowerCase().includes(searchEmp) || e.last_name.toLowerCase().includes(searchEmp) || e.role.toLowerCase().includes(searchEmp) || e.department_id.toString().includes(searchEmp))
                            .map((emp) => (
                                <tr key={emp.employee_id} className="border">
                                    <td>{emp.employee_id}</td>
                                    <td>{emp.first_name} {emp.last_name}</td>
                                    <td>{emp.department_id}</td>
                                    <td>{emp.role}</td>
                                    <td><button onClick={() => deleteEmployee(emp.employee_id)}>🗑️</button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {showDeptModal && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-5 rounded-lg">
                        <h2 className="text-lg font-bold">Add Department</h2>
                        <input type="text" placeholder="Name" className="border p-2" 
                            onChange={(e) => setNewDepartment({ ...newDepartment, department_name: e.target.value })} />
                        <button className="bg-green-500 text-white px-4 py-2 mt-2" onClick={addDepartment}>Save</button>
                    </div>
                </div>}

                {showEmpModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-5 rounded-lg w-1/3">
      <h2 className="text-lg font-bold">Add Employee</h2>

      <input type="text" placeholder="First Name" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })} />

      <input type="text" placeholder="Last Name" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })} />

      <input type="text" placeholder="Email" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />

      <input type="text" placeholder="Phone Number" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} />

      <input type="date" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, dob: e.target.value })} />

      <input type="date" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })} />

      <input type="text" placeholder="Address" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })} />

      <input type="text" placeholder="Emergency Contact" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, emergency_contact: e.target.value })} />

      <input type="text" placeholder="Bank Account Holder Name" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, account_holder_name: e.target.value })} />

      <input type="text" placeholder="Bank Account Number" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, bank_account_number: e.target.value })} />

      <input type="text" placeholder="Bank Name" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, bank_name: e.target.value })} />

      <input type="text" placeholder="IFSC Code" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, ifsc_code: e.target.value })} />

      <select className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}>
        <option value="">Select Role</option>
        <option value="Cashier">Cashier</option>
        <option value="Inventory Manager">Inventory Manager</option>
        <option value="Admin">Admin</option>
        <option value="HR Manager">HR Manager</option>
        <option value="Business Head">Business Head</option>
      </select>

      <select className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, department_id: e.target.value })}>
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.department_id} value={dept.department_id}>
            {dept.department_name}
          </option>
        ))}
      </select>

      <select className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <select className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, preferred_shifts: e.target.value })}>
        <option value="Morning">Morning</option>
        <option value="Evening">Evening</option>
        <option value="Night">Night</option>
      </select>

      <input type="number" placeholder="Salary" className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })} />

      <select className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, salary_mode: e.target.value })}>
        <option value="Bank Transfer">Bank Transfer</option>
        <option value="Cheque">Cheque</option>
        <option value="UPI">UPI</option>
        <option value="Cash">Cash</option>
      </select>

      <select className="border p-2 w-full mt-2"
        onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      <button className="bg-green-500 text-white px-4 py-2 mt-4 w-full" onClick={addEmployee}>
        Save
      </button>
      <button className="bg-red-500 text-white px-4 py-2 mt-2 w-full" onClick={() => setShowEmpModal(false)}>
        Cancel
      </button>
    </div>
  </div>
)}

            </div>
        </div>
    );
};

export default AdminPage;
