import React, { useState, useEffect } from "react";

const CashierPage = () => {
    const [bills, setBills] = useState([]);

    useEffect(() => {
        fetch("/api/cashier/bill-history")
            .then(res => res.json())
            .then(data => setBills(data))
            .catch(err => console.error("Error fetching bills:", err));
    }, []);

    return (
        <div>
            <h2>Cashier Dashboard</h2>
            <h3>Bill History</h3>
            <ul>
                {bills.map(bill => (
                    <li key={bill.transaction_id}>
                        Invoice: {bill.invoice_number} - ${bill.total_amount}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CashierPage;
