const db = require('../config/db'); 
const pdfGenerator = require('../utils/pdfGenerator'); 
const emailService = require('../utils/emailService');
const cron = require('node-cron');
const moment = require('moment');


/*'''''''''''''''''''''''''''''''''''''' 
                DASHBOARD 
''''''''''''''''''''''''''''''''''''''''''*/

exports.getTotalEmployees = async (req, res) => {
    try {
        const [result] = await db.execute("SELECT COUNT(*) AS total FROM employees");
        res.json({ totalEmployees: result[0].total });
    } catch (error) {
        console.error("Error fetching total employees:", error);
        res.status(500).json({ error: "Failed to retrieve total employees." });
    }
};

exports.getActiveEmployeesToday = async (req, res) => {
    try {
        const [result] = await db.execute(
            "SELECT COUNT(DISTINCT employee_id) AS activeToday FROM attendance WHERE date = CURDATE() AND status = 'Present'"
        );
        res.json({ activeEmployeesToday: result[0].activeToday });
    } catch (error) {
        console.error("Error fetching active employees today:", error);
        res.status(500).json({ error: "Failed to retrieve active employees today." });
    }
};

exports.getEmployeesOnLeaveToday = async (req, res) => {
    try {
        const [result] = await db.execute(
            "SELECT COUNT(*) AS onLeaveToday FROM attendance WHERE date = CURDATE() AND status = 'Leave'"
        );
        res.json({ employeesOnLeaveToday: result[0].onLeaveToday });
    } catch (error) {
        console.error("Error fetching employees on leave today:", error);
        res.status(500).json({ error: "Failed to retrieve employees on leave today." });
    }
};

exports.getUpcomingShifts = async (req, res) => {
    try {
        const [result] = await db.execute(
            `SELECT e.first_name, e.last_name, s.shift_date, s.shift_type 
             FROM shifts s 
             JOIN employees e ON s.employee_id = e.employee_id 
             WHERE s.shift_date >= CURDATE() 
             ORDER BY s.shift_date ASC 
             LIMIT 5`
        );
        res.json({ upcomingShifts: result });
    } catch (error) {
        console.error("Error fetching upcoming shifts:", error);
        res.status(500).json({ error: "Failed to retrieve upcoming shifts." });
    }
};

exports.getPendingPayrollActions = async (req, res) => {
    try {
        const [result] = await db.execute(
            "SELECT COUNT(*) AS pendingPayroll FROM payroll WHERE net_salary IS NULL"
        );
        res.json({ pendingPayrollActions: result[0].pendingPayroll });
    } catch (error) {
        console.error("Error fetching pending payroll actions:", error);
        res.status(500).json({ error: "Failed to retrieve pending payroll actions." });
    }
};

/* ----------------- ATTENDANCE TRENDS ----------------- */

exports.getWeeklyAttendanceTrends = async (req, res) => {
    try {
        const [weekly] = await db.execute(
            `SELECT DATE(date) AS day, COUNT(*) AS count 
             FROM attendance 
             WHERE date >= CURDATE() - INTERVAL 7 DAY 
             GROUP BY date 
             ORDER BY date ASC`
        );
        res.json({ weekly });
    } catch (error) {
        console.error("Error fetching weekly attendance trends:", error);
        res.status(500).json({ error: "Failed to retrieve weekly attendance trends." });
    }
};

exports.getMonthlyAttendanceTrends = async (req, res) => {
    try {
        const [monthly] = await db.execute(
            `SELECT YEAR(date) AS year, MONTH(date) AS month, COUNT(*) AS count 
FROM attendance 
WHERE date >= CURDATE() - INTERVAL 30 DAY 
GROUP BY year, month 
ORDER BY year DESC, month DESC;`
        );
        res.json({ monthly });
    } catch (error) {
        console.error("Error fetching monthly attendance trends:", error);
        res.status(500).json({ error: "Failed to retrieve monthly attendance trends." });
    }
};

/* ----------------- LEAVE STATISTICS ----------------- */

exports.getLeaveStatistics = async (req, res) => {
    try {
        const [result] = await db.execute(
            `SELECT leave_type, COUNT(*) AS count 
FROM attendance 
WHERE status = 'Leave' AND leave_type IS NOT NULL 
GROUP BY leave_type;`
        );
        res.json({ leaveStats: result });
    } catch (error) {
        console.error("Error fetching leave statistics:", error);
        res.status(500).json({ error: "Failed to retrieve leave statistics." });
    }
};

/* ----------------- PAYROLL SUMMARY ----------------- */
exports.getPayrollExpenses = async (req, res) => {
    try {
        const [expenses] = await db.execute(
            `SELECT payroll_month, payroll_year, SUM(net_salary) AS totalSalary 
             FROM payroll 
             GROUP BY payroll_year, payroll_month 
             ORDER BY payroll_year DESC, LPAD(payroll_month, 2, '0') DESC 
             LIMIT 6`
        );
        res.json({ expenses });
    } catch (error) {
        console.error("Error fetching payroll expenses:", error);
        res.status(500).json({ error: "Failed to retrieve payroll expenses." });
    }
};

exports.getPayrollDeductions = async (req, res) => {
    try {
        const [deductions] = await db.execute(
            `SELECT payroll_month, payroll_year, SUM(leave_deduction) AS totalDeductions 
             FROM payroll 
             GROUP BY payroll_year, payroll_month 
             ORDER BY payroll_year DESC, LPAD(payroll_month, 2, '0') DESC 
             LIMIT 6`
        );
        res.json({ deductions });
    } catch (error) {
        console.error("Error fetching payroll deductions:", error);
        res.status(500).json({ error: "Failed to retrieve payroll deductions." });
    }
};



/*''''''''''''''''''''''''''''''''''''''
                EMPLOYEE
''''''''''''''''''''''''''''''''''''''''''*/
exports.getEmployees = async (req, res) => {
    try {
        const { name, role, department, status } = req.query;
        let query = `SELECT e.*, d.department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.department_id WHERE 1=1`;
        let queryParams = [];

        if (name) {
            query += ` AND (e.first_name LIKE ? OR e.last_name LIKE ?)`;
            queryParams.push(`%${name}%`, `%${name}%`);
        }
        if (role) {
            query += ` AND e.role = ?`;
            queryParams.push(role);
        }
        if (department) {
            query += ` AND e.department_id = ?`;
            queryParams.push(department);
        }
        if (status) {
            query += ` AND e.status = ?`;
            queryParams.push(status);
        }

        const employees = await db.query(query, queryParams);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Database error while fetching employees' });
    }
};


exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await db.query(`SELECT e.*, d.department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.department_id WHERE e.employee_id = ?`, [id]);

        if (employee.length === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error while fetching employee' });
    }
};

exports.getEmployeeShifts = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10, offset = 0 } = req.query; // Default limit 10

        const shifts = await db.query(
            `SELECT * FROM shifts WHERE employee_id = ? ORDER BY shift_date DESC LIMIT ? OFFSET ?`,
            [id, Number(limit), Number(offset)]
        );
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving shifts' });
    }
};

exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await db.query(`SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC`, [id]);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving attendance history' });
    }
};

exports.getEmployeePayrollHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await db.query(`SELECT * FROM payroll WHERE employee_id = ? ORDER BY payroll_month DESC`, [id]);
        res.json(payroll);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving payroll history' });
    }
};


exports.addEmployee = async (req, res) => {
    try {
        const { first_name, last_name, role, department_id, phone, email, address, dob, gender, emergency_contact, hire_date, preferred_shifts, bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode } = req.body;

        if (role === 'Admin') return res.status(403).json({ error: 'Cannot add an Admin employee' });

        const query = `INSERT INTO employees (first_name, last_name, role, department_id, phone, email, address, dob, gender, emergency_contact, hire_date, preferred_shifts, bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.query(query, [first_name, last_name, role, department_id, phone, email, address, dob, gender, emergency_contact, hire_date, preferred_shifts, bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode]);

        res.json({ message: 'Employee added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding employee' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, role, department_id, phone, email, address, dob, gender, emergency_contact, hire_date, preferred_shifts, bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode, status } = req.body;

        // Prevent upgrading to Admin
        const [existingEmployee] = await db.query(`SELECT role FROM employees WHERE employee_id = ?`, [id]);
        if (existingEmployee.role !== 'Admin' && role === 'Admin') {
            return res.status(403).json({ error: 'Cannot promote an employee to Admin' });
        }

        const query = `UPDATE employees 
                       SET first_name=?, last_name=?, role=?, department_id=?, phone=?, email=?, address=?, dob=?, gender=?, emergency_contact=?, hire_date=?, preferred_shifts=?, bank_account_number=?, bank_name=?, ifsc_code=?, account_holder_name=?, salary=?, salary_mode=?, status=? 
                       WHERE employee_id=?`;

        await db.query(query, [first_name, last_name, role, department_id, phone, email, address, dob, gender, emergency_contact, hire_date, preferred_shifts, bank_account_number, bank_name, ifsc_code, account_holder_name, salary, salary_mode, status, id]);

        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating employee' });
    }
};


exports.deactivateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`UPDATE employees SET status='Inactive' WHERE employee_id=?`, [id]);
        res.json({ message: 'Employee deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Error deactivating employee' });
    }
};

exports.deleteInactiveEmployees = async () => {
    try {
        const deleteQuery = `
            DELETE FROM employees 
            WHERE status = 'Inactive' 
            AND TIMESTAMPDIFF(MONTH, hire_date, CURDATE()) > 12
            AND role NOT IN ('Admin', 'HR Manager')`;
        await db.query(deleteQuery);
        console.log('Inactive employees deleted successfully');
    } catch (error) {
        console.error('Error deleting inactive employees:', error);
    }
};


/*''''''''''''''''''''''''''''''''''''''
            SHIFTS AND ATTENDANCE
''''''''''''''''''''''''''''''''''''''''''*/
const autoGenerateShifts = async () => {
    try {
        console.log("Checking and auto-generating shifts...");

        const today = new Date().toISOString().split('T')[0];

        // Check if shifts are already generated for this month
        const [existingShifts] = await db.query(
            "SELECT COUNT(*) AS count FROM shifts WHERE shift_date >= ?",
            [today]
        );

        if (existingShifts[0].count > 0) {
            console.log("Shifts already generated. Skipping auto-generation.");
            return;
        }

        const employees = await db.query("SELECT employee_id, department_id FROM employees WHERE status = 'Active'");
        const departments = await db.query("SELECT DISTINCT department_id FROM employees");
        const shifts = ['Morning', 'Night'];

        const startDate = new Date();
        startDate.setDate(1); // First day of the month
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of the month

        for (let dept of departments) {
            let deptEmployees = employees.filter(emp => emp.department_id === dept.department_id);
            if (deptEmployees.length === 0) continue;

            let shiftIndex = 0;
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                for (let emp of deptEmployees) {
                    await db.query(
                        `INSERT INTO shifts (employee_id, shift_date, shift_type) VALUES (?, ?, ?) 
                         ON DUPLICATE KEY UPDATE shift_type = shift_type`,
                        [emp.employee_id, d.toISOString().split('T')[0], shifts[shiftIndex % 2]]
                    );
                    shiftIndex++;
                }
            }
        }
    } catch (error) {
        console.error("Error auto-generating shifts:", error);
    }
};

// Adjust shifts when an employee is absent
exports.adjustShiftsForAbsence = async (req, res) => {
    try {
        const { employeeId, date } = req.params;

        const [shift] = await db.execute(
            "SELECT shift_type FROM shifts WHERE employee_id = ? AND shift_date = ?",
            [employeeId, date]
        );

        if (!shift.length) {
            return res.status(404).json({ message: "No shift found for the given employee on this date." });
        }

        await db.query(
            `UPDATE shifts SET shift_type = 
             CASE WHEN shift_type = 'Morning' THEN 'Night' ELSE 'Morning' END
             WHERE shift_date = ? AND employee_id <> ?`,
            [date, employeeId]
        );

        res.status(200).json({ success: true, message: "Shifts adjusted for absence." });
    } catch (error) {
        console.error("Error adjusting shifts:", error);
        res.status(500).json({ message: "Error adjusting shifts", error });
    }
};


exports.getShiftSchedules = async (req, res) => {
    try {
        const [shifts] = await db.execute(
            `SELECT e.employee_id, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, 
                    COALESCE(s.shift_date, CURDATE()) AS shift_date, 
                    COALESCE(s.shift_type, 'Not Assigned') AS shift_type 
             FROM employees e
             LEFT JOIN shifts s ON e.employee_id = s.employee_id AND s.shift_date = CURDATE()
             ORDER BY e.employee_id`
        );
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shift schedules', error });
    }
};

exports.getEmployeeShifts = async (req, res) => {
    try {
        const { id } = req.params;
        const [shifts] = await db.execute(
            `SELECT shift_id, shift_date, shift_type 
             FROM shifts WHERE employee_id = ?`, 
            [id]
        );
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee shifts', error });
    }
};

exports.updateShiftSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { shift_date, shift_type } = req.body;

        // Validate input
        if (!shift_type) {
            return res.status(400).json({ message: "Missing shift_type" });
        }
        
        const [result] = await db.execute(
            `UPDATE shifts SET shift_date = ?, shift_type = ? WHERE shift_id = ?`, 
            [shift_date, shift_type, id]
        );

        // Check if update was successful
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Shift not found" });
        }

        res.status(200).json({ message: "Shift schedule updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating shift schedule", error: error.message });
    }
};


exports.getAttendanceReports = async (req, res) => {
    try {
        const { month, employee_id } = req.query;

        let query = `SELECT e.employee_id, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, 
                            DATE_FORMAT(a.date, '%Y-%m') AS month 
                     FROM attendance a 
                     JOIN employees e ON a.employee_id = e.employee_id 
                     WHERE 1=1`;

        let params = [];

        if (month) {
            query += ` AND DATE_FORMAT(a.date, '%Y-%m') = ?`;
            params.push(month);
        }
        if (employee_id) {
            query += ` AND (e.employee_id = ? OR CONCAT(e.first_name, ' ', e.last_name) LIKE ?)`;
            params.push(employee_id, `%${employee_id}%`);
        }

        query += ` GROUP BY e.employee_id, month`;  // Ensure only one entry per employee per month

        const [attendance] = await db.execute(query, params);
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance reports', error });
    }
};


exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const [attendance] = await db.execute(
            `SELECT attendance_id, date, status, leave_type, total_hours 
             FROM attendance WHERE employee_id = ?`, 
            [id]
        );
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee attendance', error });
    }
};
exports.exportAttendanceReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { month } = req.query;

        // Fetch Employee Data
        const [employee] = await db.query(`SELECT * FROM employees WHERE employee_id = ?`, [id]);
        if (!employee.length) return res.status(404).json({ message: "Employee not found" });

        // Fetch Attendance Data (filtered by month)
        const attendanceData = await db.query(
            `SELECT * FROM attendance WHERE employee_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`, 
            [id, month]
        );

        if (attendanceData.length === 0) return res.status(404).json({ message: "No attendance records found for this month" });

        // File Path
        const filePath = `payslips/attendance_${id}_${month}.pdf`;

        // Generate PDF
        await generateAttendancePDF(employee[0], attendanceData, filePath);

        // Send File as Response
        res.download(filePath, `Attendance_Report_${id}_${month}.pdf`, (err) => {
            if (err) res.status(500).json({ message: "Error generating PDF" });
        });

    } catch (error) {
        console.error("Error generating attendance report:", error);
        res.status(500).json({ message: "Server error" });
    }
};


/*''''''''''''''''''''''''''''''''''''''
        LEAVE MANAGEMENT
''''''''''''''''''''''''''''''''''''''''''*/

exports.getPendingLeaveRequests = async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT lr.leave_id, e.first_name, e.last_name, lr.leave_type, lr.start_date, lr.end_date, lr.status 
            FROM leave_requests lr 
            JOIN employees e ON lr.employee_id = e.employee_id 
            WHERE lr.status = 'Pending'`
        );
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leave requests", error });
    }
};

exports.approveLeaveRequest = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection(); // Using transactions for safety

    try {
        await connection.beginTransaction();

        // Ensure leave request exists and is pending
        const [leave] = await connection.query(
            "SELECT employee_id, leave_type, start_date, end_date FROM leave_requests WHERE leave_id = ? AND status = 'Pending'",
            [id]
        );
        if (leave.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Leave request not found or already processed" });
        }

        const { employee_id, leave_type, start_date, end_date } = leave[0];

        // Approve leave request
        await connection.query("UPDATE leave_requests SET status = 'Approved' WHERE leave_id = ?", [id]);

        // Update attendance records for the leave period
        await connection.query(
            `UPDATE attendance 
             SET status = 'Leave', leave_type = ? 
             WHERE employee_id = ? AND date BETWEEN ? AND ?`,
            [leave_type, employee_id, start_date, end_date]
        );

        await connection.commit();
        res.json({ message: "Leave request approved successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Error approving leave request", error });
    } finally {
        connection.release();
    }
};

exports.rejectLeaveRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query("UPDATE leave_requests SET status = 'Rejected' WHERE leave_id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Leave request not found or already processed" });
        }
        res.json({ message: "Leave request rejected successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting leave request", error });
    }
};

exports.requestLeave = async (req, res) => {
    const { employee_id, start_date, end_date, leave_type } = req.body;
    try {
        // Prevent duplicate leave requests for overlapping dates
        const [existing] = await db.query(
            "SELECT leave_id FROM leave_requests WHERE employee_id = ? AND (start_date <= ? AND end_date >= ?)",
            [employee_id, end_date, start_date]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: "A leave request for this period already exists" });
        }

        await db.query(
            "INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, status) VALUES (?, ?, ?, ?, 'Pending')",
            [employee_id, start_date, end_date, leave_type]
        );
        res.json({ message: "Leave request submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting leave request", error });
    }
};

/*''''''''''''''''''''''''''''''''''''''
        PAYROLL AND SALARY MANA1GEMENT
''''''''''''''''''''''''''''''''''''''''''*/

exports.processMonthlyPayroll = async (req, res) => {
    try {
        const payrollMonth = moment().format("YYYY-MM"); // Format: "YYYY-MM"
        const payrollYear = moment().year();

        // Check if payroll already processed
        const [payrollExists] = await db.query(
            `SELECT COUNT(*) AS count FROM payroll WHERE payroll_month = ? AND payroll_year = ?`,
            [payrollMonth, payrollYear]
        );

        if (payrollExists[0].count > 0) {
            return res.status(400).json({ message: "Payroll already processed for this month." });
        }

        // Fetch all active employees
        const [employees] = await db.query(
            `SELECT employee_id, salary AS base_salary FROM employees WHERE status = 'Active'`
        );

        if (employees.length === 0) {
            return res.status(400).json({ message: "No active employees found." });
        }

        console.log(`Processing payroll for ${employees.length} employees...`);

        for (let emp of employees) {
            try {
                const { employee_id, base_salary } = emp;

                // Fetch attendance details
                const [attendance] = await db.query(
                    `SELECT 
                        COALESCE(SUM(total_hours), 0) AS total_hours_worked, 
                        COALESCE(SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END), 0) AS leave_days 
                    FROM attendance 
                    WHERE employee_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
                    [employee_id, payrollMonth]
                );

                const daysInMonth = moment(payrollMonth, "YYYY-MM").daysInMonth();
                let total_hours_worked = attendance[0].total_hours_worked;
                let leave_days = attendance[0].leave_days;
                let leave_deduction = 0.00;

                // Allowed paid leaves per month
                const allowed_leaves_per_month = Math.ceil(12 / 12);
                if (leave_days > allowed_leaves_per_month) {
                    let extra_leaves = leave_days - allowed_leaves_per_month;
                    leave_deduction = (base_salary / daysInMonth) * extra_leaves;
                }

                // Insert payroll record (hourly_rate & net_salary auto-calculated)
                await db.query(
                    `INSERT INTO payroll 
                        (employee_id, payroll_month, payroll_year, base_salary, total_hours_worked, leave_deduction, bonus) 
                    VALUES (?, ?, ?, ?, ?, ?, 0.00)`,
                    [employee_id, payrollMonth, payrollYear, base_salary, total_hours_worked, leave_deduction]
                );

                console.log(`Payroll processed for Employee ID: ${employee_id}`);

            } catch (err) {
                console.error(`Error processing payroll for Employee ID: ${emp.employee_id}`, err);
            }
        }

        res.json({ message: "Payroll processed successfully for all employees." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while processing payroll." });
    }
};

exports.getPayrollStatus = async (req, res) => {
    try {
        const payrollMonth = moment().format("YYYY-MM");
        const payrollYear = moment().year();

        const [result] = await db.query(
            `SELECT COUNT(*) AS count FROM payroll WHERE payroll_month = ? AND payroll_year = ?`,
            [payrollMonth, payrollYear]
        );

        if (result[0].count > 0) {
            res.json({ status: "Processed", message: "Payroll is already processed for this month." });
        } else {
            res.json({ status: "Pending", message: "Payroll is not yet processed for this month." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while checking payroll status." });
    }
};


exports.getEmployeePayrollDetails = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const payrollMonth = moment().format("YYYY-MM");
        const payrollYear = moment().year();

        const [payroll] = await db.query(
            `SELECT payroll_id, employee_id, payroll_month, payroll_year, base_salary, 
                    total_hours_worked, hourly_rate, leave_deduction, bonus, net_salary 
             FROM payroll 
             WHERE employee_id = ? AND payroll_month = ? AND payroll_year = ?`,
            [employeeId, payrollMonth, payrollYear]
        );

        if (payroll.length === 0) {
            return res.status(404).json({ message: "Payroll not found for this employee." });
        }

        res.json({ message: "Employee payroll details fetched.", payroll: payroll[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while fetching payroll details." });
    }
};

exports.generatePayslip = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const payrollMonth = moment().format("YYYY-MM");
        const payrollYear = moment().year();

        const [payroll] = await db.query(
            `SELECT p.payroll_id, p.employee_id, p.payroll_month, p.payroll_year, p.base_salary, 
                    p.total_hours_worked, p.hourly_rate, p.leave_deduction, p.bonus, p.net_salary,
                    e.first_name, e.last_name, e.department_id, d.department_name
             FROM payroll p
             JOIN employees e ON p.employee_id = e.employee_id
             JOIN departments d ON e.department_id = d.department_id
             WHERE p.employee_id = ? AND p.payroll_month = ? AND p.payroll_year = ?`,
            [employeeId, payrollMonth, payrollYear]
        );

        if (payroll.length === 0) {
            return res.status(404).json({ message: "Payslip not available for this employee." });
        }

        const paySlip = {
            employee_name: `${payroll[0].first_name} ${payroll[0].last_name}`,
            department: payroll[0].department_name,
            payroll_month: payroll[0].payroll_month,
            payroll_year: payroll[0].payroll_year,
            base_salary: payroll[0].base_salary,
            total_hours_worked: payroll[0].total_hours_worked,
            hourly_rate: payroll[0].hourly_rate,
            leave_deduction: payroll[0].leave_deduction,
            bonus: payroll[0].bonus,
            net_salary: payroll[0].net_salary,
        };

        res.json({ message: "Payslip generated successfully.", paySlip });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while generating payslip." });
    }
};


exports.sendPayslipByEmail = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const currentMonth = moment().month() + 1;
        const currentYear = moment().year();

        const [employee] = await db.query(
            `SELECT email FROM employees WHERE employee_id = ?`, 
            [employeeId]
        );

        if (employee.length === 0) {
            return res.status(404).json({ message: "Employee not found." });
        }

        const email = employee[0].email;

        const [payroll] = await db.query(
            `SELECT e.first_name, e.last_name, e.bank_account_number, e.bank_name, 
                    e.salary_mode, p.* 
             FROM payroll p 
             JOIN employees e ON p.employee_id = e.employee_id 
             WHERE p.employee_id = ? AND p.payroll_month = ? AND p.payroll_year = ?`, 
            [employeeId, currentMonth, currentYear]
        );

        if (payroll.length === 0) {
            return res.status(404).json({ message: "Payslip not found for this month." });
        }

        const payslipData = payroll[0];
        const pdfPath = await pdfGenerator.generatePayslip(payslipData);

        await emailService.sendEmailWithAttachment(email, "Payslip for this month", "Please find your payslip attached.", pdfPath);

        res.json({ message: "Payslip sent successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending payslip via email." });
    }
};

/*
const generateRandomAttendance = async () => {
    try {
        const [employees] = await db.query("SELECT employee_id FROM employees WHERE status = 'Active'");
        const today = moment().format('YYYY-MM-DD'); // Ensures consistent date format

        for (let emp of employees) {
            const status = Math.random() > 0.1 ? 'Present' : 'Absent';

            await db.query(
                `INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE status = VALUES(status)`,
                [emp.employee_id, today, status]
            );

            if (status === 'Absent') {
                await adjustShiftsForAbsence(emp.employee_id, today);
            }
        }
    } catch (error) {
        console.error("Error generating attendance:", error);
    }
};

cron.schedule('0 0 * * *', async () => {
    console.log("Running daily attendance generation...");
    await generateRandomAttendance();
});

module.exports = { generateRandomAttendance };
*/