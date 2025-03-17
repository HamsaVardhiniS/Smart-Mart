const express = require("express");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Employee Routes
router.get("/employees", adminController.getEmployees);
router.post("/employees", adminController.createEmployee);
router.delete("/employees/:employee_id", adminController.deleteEmployee); // Ensure deleteEmployee exists

// Department Routes
router.get("/departments", adminController.getDepartments);
router.post("/departments", adminController.createDepartment);
router.delete("/departments/:department_id", adminController.deleteDepartment); // Ensure deleteDepartment exists

module.exports = router;
