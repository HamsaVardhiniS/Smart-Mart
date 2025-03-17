import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Modal = ({ isOpen, onClose, children }) => {
    const modalRef = useRef();

    useEffect(() => {
        if (isOpen) {
            const closeOnEscape = (e) => e.key === "Escape" && onClose();
            document.addEventListener("keydown", closeOnEscape);
            return () => document.removeEventListener("keydown", closeOnEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} tabIndex={-1}>
            <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <button className="close-btn" onClick={onClose} aria-label="Close Modal">✖</button>
                {children}
            </div>
        </div>
    );
};

const Payroll = () => {
    const [payrollStatus, setPayrollStatus] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [payrollDetails, setPayrollDetails] = useState(null);
    const [payslipPdf, setPayslipPdf] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchPayrollStatus();
        fetchEmployees();
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    const fetchPayrollStatus = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/hr/payroll/status");
            setPayrollStatus(data);
        } catch {
            console.error("Error fetching payroll status.");
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/hr/employees");
            setEmployees(Array.isArray(res.data) ? res.data.flat() : []);
        } catch {
            console.error("Error fetching employees.");
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredEmployees(
            term ? employees.filter(emp => `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(term)) : []
        );
    };

    const selectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setSearchTerm(`${employee.first_name} ${employee.last_name}`);
        setFilteredEmployees([]);
        fetchEmployeePayroll(employee.employee_id);
    };

    const fetchEmployeePayroll = async (employeeId) => {
        try {
            console.log(`Fetching payroll for employee with ID: ${employeeId}`);
            const { data } = await axios.get(`http://localhost:5000/api/hr/payroll/${employeeId}`);
    
            console.log("Full Payroll API Response:", data); // Debugging
    
            if (data && data.payroll) {
                setPayrollDetails(data.payroll); // Correct key!
            } else {
                console.warn("No payroll details found for this employee. API Response:", data);
                setPayrollDetails(null);
            }
        } catch (error) {
            console.error("Error fetching payroll details:", error);
            setPayrollDetails(null);
        }
    };    
    
    

    const processPayroll = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post("http://localhost:5000/api/hr/payroll/process");
            setPayrollStatus(data.success ? { status: "Processed", month: data.month } : payrollStatus);
        } finally {
            setLoading(false);
        }
    };

    const generatePayslip = async () => {
        if (!selectedEmployee) return alert("Select an employee!");
        try {
            const { data } = await axios.get(
                `http://localhost:5000/api/hr/payroll/${selectedEmployee.employee_id}/payslip`,
                { responseType: "blob" }
            );
            const pdfBlob = new Blob([data], { type: "application/pdf" });
            if (pdfBlob.size === 0) return alert("Error: Payslip is empty!");
            setPayslipPdf(URL.createObjectURL(pdfBlob));
            setIsModalOpen(true);
        } catch {
            alert("Failed to generate payslip.");
        }
    };

    const handleOutsideClick = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setFilteredEmployees([]);
        }
    };

    return (
        <div className="payroll-container">
            <h2>💰 Payroll & Salary Management</h2>

            <h3>Payroll Processing Status</h3>
            <div className="payroll-status-card">
                <p>
                    {payrollStatus?.status === "Processed" ? (
                        <>✅ Payroll for <strong>{payrollStatus?.month || "Current Month"}</strong> is Processed.</>
                    ) : (
                        <>⚠️ Payroll not yet processed for this month.</>
                    )}
                </p>
                <button onClick={processPayroll} disabled={loading || payrollStatus?.status === "Processed"}>
                    ⚡ {loading ? "Processing..." : "Process Payroll"}
                </button>
            </div>

            <h3>Search Employee Payroll</h3>
            <div className="payroll-search" ref={dropdownRef}>
                <input type="text" placeholder="Search Employee" value={searchTerm} onChange={handleSearch} required />
                {filteredEmployees.length > 0 && (
                    <ul className="dropdown">
                        {filteredEmployees.map(emp => (
                            <li key={emp.employee_id} onClick={() => selectEmployee(emp)}>
                                {emp.first_name} {emp.last_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {payrollDetails ? (
    <div className="payroll-details">
        <h4>Payroll Details for {payrollDetails.employee_name}</h4>
        <p><strong>Department:</strong> {payrollDetails.department}</p>
        <p><strong>Payroll Month:</strong> {payrollDetails.payroll_month}</p>
        <p><strong>Base Salary:</strong> ${payrollDetails.base_salary}</p>
        <p><strong>Total Hours Worked:</strong> {payrollDetails.total_hours_worked} hrs</p>
        <p><strong>Hourly Rate:</strong> ${payrollDetails.hourly_rate}</p>
        <p><strong>Leave Deduction:</strong> ${payrollDetails.leave_deduction}</p>
        <p><strong>Bonus:</strong> ${payrollDetails.bonus}</p>
        <p><strong>Net Salary:</strong> ${payrollDetails.net_salary}</p>
    </div>
) : (
    <p className="warning">⚠️ No payroll details found for this employee.</p>
)}



<h3>Generate Payslip</h3>
            <div className="payslip-actions">
                <button onClick={generatePayslip}>📄 Generate PDF</button>
                <button onClick={() => alert("Payslip sent via email!")}>📩 Send via Email</button>
            </div>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <h4>📄 Payslip Preview</h4>
                    <iframe src={payslipPdf} width="100%" height="400px" title="Payslip Preview"></iframe>
                </Modal>
            )}
        </div>
    );
};

export default Payroll;