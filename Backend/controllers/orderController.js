const db = require("../config/db");

// ✅ Fetch all orders (joins suppliers and employees)
exports.getAllOrders = (req, res) => {
    const query = `
        SELECT 
            o.order_id, o.order_date, o.status, o.total_cost, 
            s.supplier_name, e.employee_name AS processed_by
        FROM supplier_orders o
        JOIN suppliers s ON o.supplier_id = s.supplier_id
        JOIN employees e ON o.processed_by = e.employee_id
        ORDER BY o.order_date DESC;
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(results);
    });
};

// ✅ Create a new order
exports.createOrder = (req, res) => {
    const { supplier_id, processed_by } = req.body;
    if (!supplier_id || !processed_by) return res.status(400).json({ error: "Missing fields" });

    const query = `
        INSERT INTO supplier_orders (supplier_id, total_cost, order_date, status, processed_by) 
        VALUES (?, 0, NOW(), "Pending", ?);
    `;

    db.query(query, [supplier_id, processed_by], (err, result) => {
        if (err) {
            console.error("Error creating order:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        const newOrderId = result.insertId;

        db.query(
            `SELECT * FROM supplier_orders WHERE order_id = ?`, 
            [newOrderId], 
            (err, orderResults) => {
                if (err) {
                    console.error("Error fetching new order:", err);
                    return res.status(500).json({ error: "Database error", details: err.message });
                }
                res.status(201).json({ message: "Order created", order: orderResults[0] });
            }
        );
    });
};

// ✅ (Optional) Update order status
exports.updateOrderStatus = (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: "Status is required" });

    db.query(
        "UPDATE supplier_orders SET status = ? WHERE order_id = ?",
        [status, order_id],
        (err, result) => {
            if (err) {
                console.error("Error updating order status:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            res.json({ message: "Order status updated" });
        }
    );
};

// ✅ (Optional) Delete an order
exports.deleteOrder = (req, res) => {
    const { order_id } = req.params;

    db.query("DELETE FROM supplier_orders WHERE order_id = ?", [order_id], (err, result) => {
        if (err) {
            console.error("Error deleting order:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ message: "Order deleted successfully" });
    });
};
