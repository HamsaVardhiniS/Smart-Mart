const express = require('express');
const hrController = require('../controllers/hrController');
const router = express.Router();
// Dashboard

router.get('/employees/count', hrController.getTotalEmployees);
router.get('/employees/active/today', hrController.getActiveEmployeesToday);
router.get('/leaves/today', hrController.getEmployeesOnLeaveToday);
router.get('/shifts/upcoming', hrController.getUpcomingShifts);
router.get('/payroll/pending', hrController.getPendingPayrollActions);

router.get('/attendance/weekly', hrController.getWeeklyAttendanceTrends);
router.get('/attendance/monthly', hrController.getMonthlyAttendanceTrends);
router.get('/leaves/stats', hrController.getLeaveStatistics);
router.get('/payroll/expenses/monthly', hrController.getPayrollExpenses);
router.get('/payroll/deductions/monthly', hrController.getPayrollDeductions);


//Employees

router.get('/employees', hrController.getEmployees);
router.get('/employees/:id', hrController.getEmployeeById);  // Get a specific employee profile

router.get('/employees/:id/shifts', hrController.getEmployeeShifts);  // Get assigned shifts for an employee
router.get('/employees/:id/attendance', hrController.getEmployeeAttendance);  // Get attendance history
router.get('/employees/:id/payroll', hrController.getEmployeePayrollHistory);  // Get payroll history & payslip links

router.post('/employees', hrController.addEmployee);  // Add a new employee (Admin department restriction inside)
router.put('/employees/:id', hrController.updateEmployee);  // Update employee details
router.put('/employees/:id/deactivate', hrController.deactivateEmployee);  // Deactivate employee (Status = 'Inactive')

//Shifts and Attendance

router.get('/shifts', hrController.getShiftSchedules);  // Get all shifts (Auto-generates if needed)
router.get('/shifts/:id', hrController.getEmployeeShifts);  // Get shifts for an employee
router.put('/shifts/:id', hrController.updateShiftSchedule);  // Update specific shift
router.put('/shifts/adjust/:employeeId/:date', hrController.adjustShiftsForAbsence);  // Adjust shifts on absence

router.get('/attendance', hrController.getAttendanceReports);  // Get all attendance reports
router.get('/attendance/:id', hrController.getEmployeeAttendance);  // Get attendance for a specific employee
router.get('/attendance/:id/export', hrController.exportAttendanceReport);  // Export attendance report


//Leave Management

router.get('/leave-requests', hrController.getPendingLeaveRequests);
router.put('/leave-requests/:id/approve', hrController.approveLeaveRequest);
router.put('/leave-requests/:id/reject', hrController.rejectLeaveRequest);
router.post('/leave-requests', hrController.requestLeave);

//Payroll & Salary Management

router.post('/payroll/process', hrController.processMonthlyPayroll);  
router.get('/payroll/status', hrController.getPayrollStatus);  

router.get('/payroll/:employeeId', hrController.getEmployeePayrollDetails);  
router.get('/payroll/:employeeId/payslip', hrController.generatePayslip);  
router.post('/payroll/:employeeId/payslip/send', hrController.sendPayslipByEmail);



module.exports = router;
