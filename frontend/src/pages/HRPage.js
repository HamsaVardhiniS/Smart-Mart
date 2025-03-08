import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Modal, Input, Select, message, DatePicker } from "antd";

axios.defaults.baseURL = "http://localhost:5000/api/hr";

const HRPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); // Added departments state
  const [searchTerm, setSearchTerm] = useState("");
  const [empModalVisible, setEmpModalVisible] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: "", last_name: "", role: "Cashier", department_id: "", phone: "",
    email: "", address: "", dob: "", gender: "Male", emergency_contact: "",
    hire_date: "", shift: "Morning", status: "Active", password: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments(); // Fetch departments
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/employees");
      setEmployees(res.data);
    } catch (error) {
      message.error("Failed to fetch employees");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/departments"); // Ensure this endpoint exists
      setDepartments(res.data);
    } catch (error) {
      message.error("Failed to fetch departments");
    }
  };

  const createEmployee = async () => {
    if (!newEmployee.first_name || !newEmployee.email || !newEmployee.password)
      return message.warning("First name, email, and password are required");

    try {
      await axios.post("/employees", newEmployee);
      message.success("Employee added successfully");
      setEmpModalVisible(false);
      fetchEmployees();
    } catch (error) {
      message.error("Failed to add employee");
    }
  };

  const deleteEmployee = async (employee_id) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this employee?",
      onOk: async () => {
        try {
          await axios.delete(`/employees/${employee_id}`);
          message.success("Employee deleted successfully");
          fetchEmployees();
        } catch (error) {
          message.error("Failed to delete employee");
        }
      },
    });
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Left Pane */}
      <div style={{ width: "20%", padding: "10px", borderRight: "1px solid #ddd" }}>
        <h3>Actions</h3>
        <Button danger block>Delete Employee</Button>
        <Button block style={{ marginTop: "10px" }}>Update Employee</Button>
        <Button block style={{ marginTop: "10px" }}>Manage Salary</Button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {/* Top Section */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "60%" }}
          />
          <Button type="primary" onClick={() => setEmpModalVisible(true)}>+ Add Employee</Button>
        </div>

        {/* Employee Table */}
        <Table
          rowKey="employee_id"
          dataSource={employees.filter(emp =>
            emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.last_name.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          columns={[
            { title: "First Name", dataIndex: "first_name" },
            { title: "Last Name", dataIndex: "last_name" },
            { title: "Role", dataIndex: "role" },
            { title: "Department", dataIndex: "department_id" },
            { title: "Phone", dataIndex: "phone" },
            { title: "Email", dataIndex: "email" },
            {
              title: "Actions",
              render: (text, record) => (
                <Button danger onClick={() => deleteEmployee(record.employee_id)}>Delete</Button>
              ),
            },
          ]}
        />
      </div>

      {/* Add Employee Modal */}
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

export default HRPage;
