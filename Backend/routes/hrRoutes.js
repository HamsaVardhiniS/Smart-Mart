const express = require("express");
const router = express.Router();
const hrController = require("../controllers/hrController");

// Get all employees (excluding Admin & HR)
router.get("/employees", hrController.getEmployees);

// Get employees by department (excluding Admin & HR)
router.get("/employees/department/:department_id", hrController.getEmployeesByDepartment);

// Create a new employee (HR cannot add Admin or HR employees)
router.post("/employees", hrController.createEmployee);

// Update employee details (HR can update only personal details, excluding salary and bank details)
router.put("/employees/:employee_id", hrController.updateEmployee);

// Delete employee (HR cannot delete Admin or HR employees)
router.delete("/employees/:employee_id", hrController.deleteEmployee);

module.exports = router;
