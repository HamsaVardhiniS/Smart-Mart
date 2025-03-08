const db = require("../config/db");

// Get Employees (HR can only see employees excluding Admin & HR)
exports.getEmployees = async (req, res) => {
    try {
        const [employees] = await db.query("SELECT * FROM employees WHERE role NOT IN ('Admin', 'HR Manager')");
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Employees by Department
exports.getEmployeesByDepartment = async (req, res) => {
    const { department_id } = req.params;
    try {
        const [employees] = await db.query("SELECT * FROM employees WHERE department_id = ? AND role NOT IN ('Admin', 'HR Manager')", [department_id]);
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Employee (HR can add any role except Admin & HR)
exports.createEmployee = async (req, res) => {
    const {
        first_name, last_name, role, department_id, phone, email, address, dob, gender,
        emergency_contact, hire_date, shift, status, password, bank_account_number,
        bank_name, ifsc_code, account_holder_name, salary, salary_mode
    } = req.body;

    try {
        // Prevent HR from creating Admin or HR employees
        if (["Admin", "HR Manager"].includes(role)) {
            return res.status(403).json({ message: "HR cannot add Admin or HR employees." });
        }

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
            emergency_contact, hire_date, shift, status, password_hash, 
            bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                first_name, last_name, role, department_id, phone, email, address, dob, gender,
                emergency_contact, hire_date, shift, status, hashedPassword,
                bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode
            ]
        );

        res.status(201).json({ message: "Employee created successfully" });

    } catch (err) {
        console.error("Error creating employee:", err);
        res.status(500).json({ error: "Failed to add employee" });
    }
};


// Update Employee (Only personal details)
exports.updateEmployee = async (req, res) => {
    const { employee_id } = req.params;
    const { first_name, last_name, phone, email, address, dob, gender, emergency_contact, shift } = req.body;

    try {
        const [existing] = await db.query("SELECT role FROM employees WHERE employee_id = ?", [employee_id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const role = existing[0].role;
        if (role === "Admin" || role === "HR Manager") {
            return res.status(403).json({ message: "HR cannot update Admin or HR employees" });
        }

        await db.query(
            `UPDATE employees 
            SET first_name=?, last_name=?, phone=?, email=?, address=?, dob=?, gender=?, emergency_contact=?, shift=? 
            WHERE employee_id=?`,
            [first_name, last_name, phone, email, address, dob, gender, emergency_contact, shift, employee_id]
        );

        res.json({ message: "Employee updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Employee (HR cannot delete Admin or HR employees)
exports.deleteEmployee = async (req, res) => {
    const { employee_id } = req.params;

    try {
        const [existing] = await db.query("SELECT role FROM employees WHERE employee_id = ?", [employee_id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const role = existing[0].role;
        if (role === "Admin" || role === "HR Manager") {
            return res.status(403).json({ message: "HR cannot delete Admin or HR employees" });
        }

        const [result] = await db.query("DELETE FROM employees WHERE employee_id = ?", [employee_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
