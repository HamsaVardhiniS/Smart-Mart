const express = require("express");
const {
    getEmployees,
    createEmployee,
    deleteEmployee, // Ensure it's imported
    getDepartments,
    createDepartment,
    deleteDepartment // Ensure it's imported
} = require("../controllers/adminController");

const router = express.Router();

// Employee Routes
router.get("/employees", getEmployees);
router.post("/employees", createEmployee);
router.delete("/employees/:employee_id", deleteEmployee); // Fix Delete Employee Route

// Department Routes
router.get("/departments", getDepartments);
router.post("/departments", createDepartment);
router.delete("/departments/:department_id", deleteDepartment); // Fix Delete Department Route

module.exports = router;
