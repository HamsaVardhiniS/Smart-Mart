const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


const generateAttendancePDF = (employee, attendanceData, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        // Pipe the document to a writable stream (file)
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // 📌 Title
        doc.fontSize(18).text(`Attendance Report for ${employee.first_name} ${employee.last_name}`, { align: 'center' });
        doc.moveDown();

        // 📌 Employee Details
        doc.fontSize(12).text(`Employee ID: ${employee.employee_id}`);
        doc.text(`Role: ${employee.role}`);
        doc.text(`Department ID: ${employee.department_id}`);
        doc.text(`Phone: ${employee.phone}`);
        doc.moveDown();

        // 📌 Table Header
        doc.fontSize(14).text("Attendance Details", { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Date       | Shift   | Status        | Hours Worked`);
        doc.text(`-----------------------------------------------------`);

        // 📌 Attendance Data
        attendanceData.forEach(record => {
            doc.text(
                `${record.date} | ${record.shift_type} | ${record.status} | ${record.total_hours ? record.total_hours : "N/A"}`
            );
        });

        // 📌 Footer
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });

        // Finish PDF and save
        doc.end();

        // Resolve when the file is completely written
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};

module.exports = { generateAttendancePDF };

const payslipDirectory = path.join(__dirname, '../payslips/');

// Ensure the `payslips/` directory exists
if (!fs.existsSync(payslipDirectory)) {
    fs.mkdirSync(payslipDirectory, { recursive: true });
}

const generatePayslip = (payslipData) => {
    return new Promise((resolve, reject) => {
        const fileName = `Payslip_${payslipData.employee_id}_${payslipData.payroll_month}_${payslipData.payroll_year}.pdf`;
        const filePath = path.join(payslipDirectory, fileName);

        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // 📌 Title
        doc.fontSize(18).text(`Payslip - ${payslipData.payroll_month}/${payslipData.payroll_year}`, { align: 'center' });
        doc.moveDown();

        // 📌 Employee Details
        doc.fontSize(12).text(`Employee ID: ${payslipData.employee_id}`);
        doc.text(`Name: ${payslipData.first_name} ${payslipData.last_name}`);
        doc.text(`Bank: ${payslipData.bank_name}`);
        doc.text(`Account Number: ${payslipData.bank_account_number}`);
        doc.text(`Salary Mode: ${payslipData.salary_mode}`);
        doc.moveDown();

        // 📌 Salary Breakdown
        doc.fontSize(14).text("Salary Breakdown", { underline: true });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Base Salary: ₹${payslipData.base_salary.toFixed(2)}`);
        doc.text(`Total Hours Worked: ${payslipData.total_hours_worked} hours`);
        doc.text(`Hourly Rate: ₹${payslipData.hourly_rate.toFixed(2)}`);
        doc.text(`Leave Deduction: -₹${payslipData.leave_deduction.toFixed(2)}`);
        doc.text(`Bonus: +₹${payslipData.bonus.toFixed(2)}`);
        doc.text(`Net Salary: ₹${payslipData.net_salary.toFixed(2)}`);
        doc.moveDown();

        // 📌 Footer
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });

        // Finish PDF and save
        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};

module.exports = { generatePayslip };