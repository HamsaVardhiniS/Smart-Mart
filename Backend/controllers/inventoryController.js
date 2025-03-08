const db = require("../config/db");

// Fetch all products with inventory details
exports.getAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.product_id, p.product_name, p.unit, p.reorder_level, p.stock_threshold_alert,
                p.tax_percentage, p.date_added, p.last_updated,
                c.category_name, s.subcategory_name, b.brand_name,
                i.batch_id, i.quantity AS stock_quantity, i.expiry_date, i.cost_per_unit, 
                i.purchase_rate, i.mrp, i.sales_rate, i.date_received
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.category_id
            LEFT JOIN product_subcategories s ON p.subcategory_id = s.subcategory_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN inventory_batches i ON p.product_id = i.product_id
            ORDER BY p.product_id DESC;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products." });
    }
};

// Search products based on query
exports.searchProducts = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query parameter is required." });

    try {
        const sql = `
            SELECT 
                p.product_id, p.product_name, p.unit, p.reorder_level, p.stock_threshold_alert,
                c.category_name, s.subcategory_name, b.brand_name,
                i.batch_id, i.quantity AS stock_quantity, i.expiry_date, i.sales_rate
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.category_id
            LEFT JOIN product_subcategories s ON p.subcategory_id = s.subcategory_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN inventory_batches i ON p.product_id = i.product_id
            WHERE p.product_name LIKE ? OR c.category_name LIKE ? OR b.brand_name LIKE ?
        `;
        const [rows] = await db.query(sql, [`%${query}%`, `%${query}%`, `%${query}%`]);
        res.json(rows);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Failed to search products." });
    }
};

// Update product details
exports.updateProduct = async (req, res) => {
    const { product_id } = req.params;
    const { product_name, category_id, subcategory_id, brand_id, unit, reorder_level, tax_percentage } = req.body;

    try {
        const sql = `
            UPDATE products 
            SET product_name = ?, category_id = ?, subcategory_id = ?, brand_id = ?, 
                unit = ?, reorder_level = ?, tax_percentage = ?, last_updated = CURRENT_TIMESTAMP 
            WHERE product_id = ?
        `;
        await db.query(sql, [product_name, category_id, subcategory_id, brand_id, unit, reorder_level, tax_percentage, product_id]);
        res.json({ message: "Product updated successfully." });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update product." });
    }
};

// Fetch supplier orders
exports.getSupplierOrders = async (req, res) => {
    try {
        const query = `
            SELECT so.order_id, so.total_cost, so.order_date, so.status, 
                   s.supplier_name, e.first_name AS processed_by
            FROM supplier_orders so
            JOIN suppliers s ON so.supplier_id = s.supplier_id
            LEFT JOIN employees e ON so.processed_by = e.employee_id
            ORDER BY so.order_date DESC;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching supplier orders:", error);
        res.status(500).json({ error: "Failed to fetch supplier orders." });
    }
};

// Fetch inventory batches
exports.getInventoryBatches = async (req, res) => {
    try {
        const query = `
            SELECT ib.batch_id, p.product_name, s.supplier_name, ib.quantity, ib.expiry_date, 
                   ib.cost_per_unit, ib.mrp, ib.sales_rate, ib.date_received
            FROM inventory_batches ib
            JOIN products p ON ib.product_id = p.product_id
            LEFT JOIN suppliers s ON ib.supplier_id = s.supplier_id
            ORDER BY ib.date_received DESC;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching inventory batches:", error);
        res.status(500).json({ error: "Failed to fetch inventory batches." });
    }
};

// Fetch sales transactions
exports.getSalesTransactions = async (req, res) => {
    try {
        const query = `
            SELECT st.transaction_id, st.invoice_number, st.total_amount, st.other_discount, st.tax_amount, 
                   st.net_amount, st.payment_method, st.transaction_date, 
                   e.first_name AS cashier_name, c.customer_name
            FROM sales_transactions st
            LEFT JOIN employees e ON st.processed_by = e.employee_id
            LEFT JOIN customers c ON st.customer_id = c.customer_id
            ORDER BY st.transaction_date DESC;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching sales transactions:", error);
        res.status(500).json({ error: "Failed to fetch sales transactions." });
    }
};

exports.getAllSuppliers = async (req, res) => {
    try {
        const { search } = req.query;

        let query = `SELECT * FROM suppliers`;
        let values = [];

        if (search) {
            query += ` WHERE supplier_name LIKE ? OR contact_person LIKE ? OR gst_number LIKE ?`;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [suppliers] = await db.query(query, values);
        res.json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Create a new supplier
exports.createSupplier = async (req, res) => {
    try {
        const { supplier_name, contact_person, phone, email, address, city, country, gst_number, status } = req.body;

        // Validate required fields
        if (!supplier_name || !contact_person || !phone || !email || !gst_number) {
            return res.status(400).json({ message: "All required fields must be filled!" });
        }

        const insertQuery = `
            INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, city, country, gst_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [
            supplier_name, contact_person, phone, email, address, city, country, gst_number, status || "Active"
        ]);

        // Return the newly created supplier
        const [newSupplier] = await db.query(`SELECT * FROM suppliers WHERE supplier_id = ?`, [result.insertId]);

        res.status(201).json(newSupplier[0]); // Return created supplier
    } catch (error) {
        console.error("Error adding supplier:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Update supplier details
exports.updateSupplier = async (req, res) => {
    try {
        const { supplier_id } = req.params;
        const { supplier_name, contact_person, phone, email, address, city, country, gst_number, status } = req.body;

        if (!supplier_id) {
            return res.status(400).json({ message: "Supplier ID is required!" });
        }

        const updateQuery = `
            UPDATE suppliers 
            SET supplier_name = ?, contact_person = ?, phone = ?, email = ?, address = ?, city = ?, country = ?, gst_number = ?, status = ?
            WHERE supplier_id = ?
        `;

        await db.query(updateQuery, [
            supplier_name, contact_person, phone, email, address, city, country, gst_number, status, supplier_id
        ]);

        const [updatedSupplier] = await db.query(`SELECT * FROM suppliers WHERE supplier_id = ?`, [supplier_id]);

        res.json(updatedSupplier[0]);
    } catch (error) {
        console.error("Error updating supplier:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
