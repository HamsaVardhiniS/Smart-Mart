import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Modal, Input, Select, message, DatePicker } from "antd";

axios.defaults.baseURL = "http://localhost:5000/api/admin"; // Correct API base URL

const AdminPage = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [empModalVisible, setEmpModalVisible] = useState(false);
  
  const [newDept, setNewDept] = useState({ department_name: "", manager_id: "" });
  const [newEmployee, setNewEmployee] = useState({
    first_name: "", last_name: "", role: "Cashier", department_id: "", phone: "",
    email: "", address: "", dob: "", gender: "Male", emergency_contact: "",
    hire_date: "", shift: "Morning", status: "Active", password: "",
    bank_account_number: "", bank_name: "", ifsc_code: "", account_holder_name: "",
    salary: "", salary_mode: "Bank Transfer"
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      message.error("Failed to fetch departments");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/employees");
      setEmployees(res.data);
    } catch (error) {
      message.error("Failed to fetch employees");
    }
  };

  const createDepartment = async () => {
    if (!newDept.department_name) return message.warning("Department name is required");
    try {
      await axios.post("/departments", newDept);
      message.success("Department created successfully");
      setDeptModalVisible(false);
      fetchDepartments();
    } catch (error) {
      message.error("Failed to create department");
    }
  };

  const createEmployee = async () => {
    console.log("🔍 Creating Employee Data:", newEmployee); // Debugging log before API call
  
    if (!newEmployee.first_name || !newEmployee.email || !newEmployee.password)
      return message.warning("First name, email, and password are required");
  
    try {
      const response = await axios.post("/employees", newEmployee);
      console.log("✅ Employee Created Successfully:", response.data); // Log response data
  
      message.success("Employee added successfully");
      setEmpModalVisible(false);
      fetchEmployees(); // Refresh list
    } catch (error) {
      console.error("❌ Failed to create employee:", error.response?.data || error.message);
      message.error("Failed to add employee");
    }
  };
  
  const deleteDepartment = async (department_id) => {
    console.log("Deleting department with ID:", department_id); // Debug log
  
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this department?",
      onOk: async () => {
        try {
          const response = await axios.delete(`/departments/${department_id}`);
          console.log("Delete response:", response); // Debug log
          message.success("Department deleted successfully");
          fetchDepartments();
        } catch (error) {
          console.error("Delete failed:", error.response?.data || error.message); // Debug log
          message.error("Failed to delete department");
        }
      },
    });
  };

  const deleteEmployee = async (employee_id) => {
    console.log("Deleting employee with ID:", employee_id); // Debug log
  
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this employee?",
      onOk: async () => {
        try {
          const response = await axios.delete(`/employees/${employee_id}`);
          console.log("Delete response:", response); // Debug log
          message.success("Employee deleted successfully");
          fetchEmployees();
        } catch (error) {
          console.error("Delete failed:", error.response?.data || error.message); // Debug log
          message.error("Failed to delete employee");
        }
      },
    });
  };  

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {/* 🔹 Departments Section */}
      <h3>Departments</h3>
      <Button onClick={() => setDeptModalVisible(true)}>Add Department</Button>
      <Table
        rowKey="department_id"
        dataSource={departments}
        columns={[
          { title: "Department ID", dataIndex: "department_id" },
          { title: "Department Name", dataIndex: "department_name" },
          {
            title: "Actions",
            render: (text, record) => (
<Button 
  onClick={() => {
    console.log("Clicked Delete for Department ID:", record.department_id); // Debug log
    deleteDepartment(record.department_id);
  }} 
  danger
>
  Delete
</Button>
             ),
          },
        ]}
      />

      {/* 🔹 Employees Section */}
      <h3>Employees</h3>
      <Button onClick={() => setEmpModalVisible(true)}>Add Employee</Button>
      <Table
        rowKey="employee_id"
        dataSource={employees}
        columns={[
          { title: "Employee ID", dataIndex: "employee_id" },
          { title: "First Name", dataIndex: "first_name" },
          { title: "Last Name", dataIndex: "last_name" },
          { title: "Role", dataIndex: "role" },
          { title: "Department", dataIndex: "department_id" },
          { title: "Phone", dataIndex: "phone" },
          { title: "Email", dataIndex: "email" },
          { title: "Status", dataIndex: "status" },
          {
            title: "Actions",
            render: (text, record) => (
<Button 
  onClick={() => {
    console.log("Clicked Delete for Employee ID:", record.employee_id); // Debug log
    deleteEmployee(record.employee_id);
  }} 
  danger
>
  Delete
</Button>            ),
          },
        ]}
      />
  
      <Modal title="Add Department" open={deptModalVisible} onCancel={() => setDeptModalVisible(false)} onOk={createDepartment}>
        <Input placeholder="Department Name" value={newDept.department_name} onChange={(e) => setNewDept({ ...newDept, department_name: e.target.value })} />
        <Input placeholder="Manager ID (Optional)" value={newDept.manager_id} onChange={(e) => setNewDept({ ...newDept, manager_id: e.target.value })} />
      </Modal>
  
      <Modal title="Add Employee" open={empModalVisible} onCancel={() => setEmpModalVisible(false)} onOk={createEmployee}>
        <Input placeholder="First Name" value={newEmployee.first_name} onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })} />
        <Input placeholder="Last Name" value={newEmployee.last_name} onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })} />
        <Select value={newEmployee.role} onChange={(value) => setNewEmployee({ ...newEmployee, role: value })}>
          <Select.Option value="Cashier">Cashier</Select.Option>
          <Select.Option value="Inventory Manager">Inventory Manager</Select.Option>
          <Select.Option value="Admin">Admin</Select.Option>
          <Select.Option value="HR Manager">HR Manager</Select.Option>
          <Select.Option value="Business Head">Business Head</Select.Option>
        </Select>
        <Select value={newEmployee.department_id} onChange={(value) => setNewEmployee({ ...newEmployee, department_id: value })}>
          {departments.map((dept) => (
            <Select.Option key={dept.department_id} value={dept.department_id}>
              {dept.department_name}
            </Select.Option>
          ))}
        </Select>
        <Input placeholder="Email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
        <Input.Password placeholder="Password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} />
        <Input placeholder="Phone" value={newEmployee.phone} onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} />
        <Input placeholder="Address" value={newEmployee.address} onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })} />
        <DatePicker onChange={(date, dateString) => setNewEmployee({ ...newEmployee, dob: dateString })} />
        <Select value={newEmployee.gender} onChange={(value) => setNewEmployee({ ...newEmployee, gender: value })}>
          <Select.Option value="Male">Male</Select.Option>
          <Select.Option value="Female">Female</Select.Option>
        </Select>
        <Input placeholder="Emergency Contact" value={newEmployee.emergency_contact} onChange={(e) => setNewEmployee({ ...newEmployee, emergency_contact: e.target.value })} />
        <DatePicker onChange={(date, dateString) => setNewEmployee({ ...newEmployee, hire_date: dateString })} />
        <Select value={newEmployee.shift} onChange={(value) => setNewEmployee({ ...newEmployee, shift: value })}>
          <Select.Option value="Morning">Morning</Select.Option>
          <Select.Option value="Evening">Evening</Select.Option>
        </Select>
        <Select value={newEmployee.status} onChange={(value) => setNewEmployee({ ...newEmployee, status: value })}>
          <Select.Option value="Active">Active</Select.Option>
          <Select.Option value="Inactive">Inactive</Select.Option>
        </Select>
        <Input placeholder="Bank Account Number" value={newEmployee.bank_account_number} onChange={(e) => setNewEmployee({ ...newEmployee, bank_account_number: e.target.value })} />
        <Input placeholder="Bank Name" value={newEmployee.bank_name} onChange={(e) => setNewEmployee({ ...newEmployee, bank_name: e.target.value })} />
        <Input placeholder="IFSC Code" value={newEmployee.ifsc_code} onChange={(e) => setNewEmployee({ ...newEmployee, ifsc_code: e.target.value })} />
        <Input placeholder="Account Holder Name" value={newEmployee.account_holder_name} onChange={(e) => setNewEmployee({ ...newEmployee, account_holder_name: e.target.value })} />
        <Input placeholder="Salary" value={newEmployee.salary} onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })} />
        <Select value={newEmployee.salary_mode} onChange={(value) => setNewEmployee({ ...newEmployee, salary_mode: value })}>
          <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
          <Select.Option value="Cash">Cash</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};  

export default AdminPage;
