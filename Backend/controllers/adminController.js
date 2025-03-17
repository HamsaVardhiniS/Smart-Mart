const db = require("../config/db");
const bcrypt = require("bcrypt");

// Create Department
exports.createDepartment = async (req, res) => {
    const { department_name, manager_id } = req.body;
    try {
        // Check if department already exists
        const [existing] = await db.query("SELECT * FROM departments WHERE department_name = ?", [department_name]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Department already exists" });
        }

        // Insert new department
        await db.query("INSERT INTO departments (department_name, manager_id) VALUES (?, ?)", [department_name, manager_id || null]);
        res.status(201).json({ message: "Department created successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Departments (with optional search by name)
exports.getDepartments = async (req, res) => {
    try {
        const { search } = req.query;
        let query = "SELECT * FROM departments";
        let values = [];

        if (search) {
            query += " WHERE department_name LIKE ?";
            values.push(`%${search}%`);
        }

        const [departments] = await db.query(query, values);
        res.json(departments);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
    const { department_id } = req.params;
    try {
        const [result] = await db.query("DELETE FROM departments WHERE department_id = ?", [department_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json({ message: "Department deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Employee
exports.createEmployee = async (req, res) => {
    const {
        first_name, last_name, role, department_id, phone, email, address, dob, gender,
        emergency_contact, hire_date, preferred_shifts, status, password, bank_account_number,
        bank_name, ifsc_code, account_holder_name, salary, salary_mode
    } = req.body;

    try {
        // Check if employee with the same email already exists
        const [existing] = await db.query("SELECT * FROM employees WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new employee
        await db.query(
            `INSERT INTO employees 
            (first_name, last_name, role, department_id, phone, email, address, dob, gender, 
            emergency_contact, hire_date, preferred_shifts, status, password_hash, 
            bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, role, department_id, phone, email, address, dob, gender,
            emergency_contact, hire_date, preferred_shifts, status, hashedPassword,
            bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode]
        );

        res.status(201).json({ message: "Employee created successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Employees (with optional search by name or role)
exports.getEmployees = async (req, res) => {
    try {
        const { search } = req.query;
        let query = "SELECT * FROM employees";
        let values = [];

        if (search) {
            query += " WHERE first_name LIKE ? OR last_name LIKE ? OR role LIKE ?";
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [employees] = await db.query(query, values);
        res.json(employees);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
    const { employee_id } = req.params;
    try {
        const [result] = await db.query("DELETE FROM employees WHERE employee_id = ?", [employee_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json({ message: "Employee deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
