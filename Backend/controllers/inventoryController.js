const db = require("../config/db");

// =========================================================
// PRODUCT MANAGEMENT
// =========================================================

// Add new product
exports.addProduct = async (req, res) => {
    const { product_name, brand_id, category_id, subcategory_id, unit, reorder_level, tax_percentage } = req.body;

    if (!product_name || !category_id || !unit) {
        return res.status(400).json({ error: "Product name, category, and unit are required." });
    }

    try {
        const query = `
            INSERT INTO products (product_name, brand_id, category_id, subcategory_id, unit, reorder_level, tax_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            product_name, brand_id || null, category_id, subcategory_id || null, unit, reorder_level || 10, tax_percentage || 0
        ]);

        const [newProduct] = await db.query(`SELECT * FROM products WHERE product_id = ?`, [result.insertId]);
        res.status(201).json(newProduct[0]);
    } catch (error) {
        console.error("Failed to add product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
};

// Fetch all products with inventory details
exports.getAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.product_id, p.product_name, p.unit, p.reorder_level, 
                p.stock_threshold_alert, p.tax_percentage, p.date_added, p.last_updated,
                c.category_name, s.subcategory_name, b.brand_name,
                i.batch_id, i.quantity AS stock_quantity, i.expiry_date, 
                i.cost_per_unit, i.purchase_rate, i.mrp, i.sales_rate, i.date_received
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

// Fetch single product by ID
exports.getProductById = async (req, res) => {
    const { product_id } = req.params;
    try {
        const [product] = await db.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
        if (product.length > 0) {
            res.json(product[0]);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
};

// Update Product Details
exports.updateProduct = async (req, res) => {
    const { product_id } = req.params;
    const { product_name, brand_id, category_id, subcategory_id, reorder_level, tax_percentage } = req.body;

    try {
        const sql = `
            UPDATE products
            SET product_name = ?, brand_id = ?, category_id = ?, subcategory_id = ?, 
                reorder_level = ?, tax_percentage = ?, last_updated = CURRENT_TIMESTAMP
            WHERE product_id = ?
        `;
        await db.query(sql, [product_name, brand_id, category_id, subcategory_id, reorder_level, tax_percentage, product_id]);
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Failed to update product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// Search products by name
exports.searchProductByName = async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "Search term is required" });
    }

    try {
        const [products] = await db.query(
           "SELECT * FROM products WHERE product_name LIKE ?",
            [`%${name}%`]
        );
        if (products.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =========================================================
// SUPPLIER MANAGEMENT
// =========================================================

// Fetch all suppliers
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

// Create a new supplier
exports.createSupplier = async (req, res) => {
    try {
        const { supplier_name, contact_person, phone, email, address, city, country, gst_number, status } = req.body;
        if (!supplier_name || !contact_person || !phone || !email || !gst_number) {
            return res.status(400).json({ message: "All required fields must be filled!" });
        }

        const insertQuery = `
            INSERT INTO suppliers (supplier_name, contact_person, phone, email, 
                address, city, country, gst_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [
            supplier_name, contact_person, phone, email, address, city, country, gst_number, status || "Active"
        ]);

        const [newSupplier] = await db.query(`SELECT * FROM suppliers WHERE supplier_id = ?`, [result.insertId]);
        res.status(201).json(newSupplier[0]);
    } catch (error) {
        console.error("Error adding supplier:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update supplier details
exports.updateSupplier = async (req, res) => {
    const { supplier_id } = req.params;
    const { supplier_name, contact_person, phone, email, address, city, country, gst_number, status } = req.body;

    try {
        await db.query(`
            UPDATE suppliers 
            SET supplier_name = ?, contact_person = ?, phone = ?, email = ?, 
                address = ?, city = ?, country = ?, gst_number = ?, status = ?
            WHERE supplier_id = ?
        `, [
            supplier_name, contact_person, phone, email, address, city, 
            country, gst_number, status, supplier_id
        ]);

        const [updatedSupplier] = await db.query(`SELECT * FROM suppliers WHERE supplier_id = ?`, [supplier_id]);
        res.json(updatedSupplier[0]);
    } catch (error) {
        console.error("Error updating supplier:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Fetch all orders placed by one supplier
exports.getAllOrdersBySupplier = async (req, res) => {
    const { supplier_id } = req.params;
    if (!supplier_id) return res.status(400).json({ error: "Supplier ID is required" });

    try {
        const query = `
            SELECT 
                so.order_id, so.order_date, so.total_cost, so.status, 
                e.first_name AS processed_by
            FROM supplier_orders so
            LEFT JOIN employees e ON so.processed_by = e.employee_id
            WHERE so.supplier_id = ?
            ORDER BY so.order_date DESC
        `;
        const [orders] = await db.query(query, [supplier_id]);

        res.json(orders);
    } catch (error) {
        console.error("Failed to fetch orders by supplier:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// =========================================================
// ORDER MANAGEMENT
// =========================================================

// Place Order from Supplier (with Transaction Handling)
exports.placeSupplierOrder = async (req, res) => {
    const { supplier_id, products, processed_by } = req.body;

    if (!supplier_id || !products.length || !processed_by) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.rate), 0);

    try {
        // Begin Transaction
        await db.query('START TRANSACTION');

        // Insert order first and get the orderId
        const [orderResult] = await db.query(`
            INSERT INTO supplier_orders (supplier_id, total_cost, processed_by)
            VALUES (?, ?, ?)
        `, [supplier_id, totalCost, processed_by]);

        const orderId = orderResult.insertId;

        // Generate invoice number after getting the orderId
        const invoiceNumber = `SO-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${orderId}`;

        // Update the supplier order with the invoice number
        await db.query(`
            UPDATE supplier_orders
            SET invoice_number = ?
            WHERE order_id = ?
        `, [invoiceNumber, orderId]);

        // Insert order items
        for (const product of products) {
            await db.query(`
                INSERT INTO supplier_order_items
                (order_id, product_id, quantity_supplied, unit_cost)
                VALUES (?, ?, ?, ?)
            `, [orderId, product.product_id, product.quantity, product.rate]);
        }

        // Commit transaction if all goes well
        await db.query('COMMIT');

        res.status(201).json({ message: "Order placed successfully", order_id: orderId });
    } catch (error) {
        // Rollback if any error occurs
        await db.query('ROLLBACK');
        console.error("Error placing order:", error.sqlMessage);
        res.status(500).json({ error: error.sqlMessage });
    }
};


// View Current Orders
exports.getCurrentOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT so.order_id, s.supplier_name, so.total_cost, 
                   so.order_date, so.status, so.invoice_number
            FROM supplier_orders so
            JOIN suppliers s ON so.supplier_id = s.supplier_id
            WHERE so.status IN ('Pending', 'Processing', 'Partial', 'Waiting')
            ORDER BY so.order_date DESC;
        `);

        res.json(orders);
    } catch (error) {
        console.error("Error fetching current orders:", error);
        res.status(500).json({ error: "Failed to fetch current orders" });
    }
};


// Update Order Status & Auto-Insert Inventory (with Transaction Handling)
exports.updateOrderStatus = async (req, res) => {
    const { invoice_number } = req.params;
    const { status, expiry_dates } = req.body;

    if (!invoice_number || !status) {
        return res.status(400).json({ error: "Invoice number and status are required" });
    }

    const connection = await db.getConnection(); // Get a DB connection
    try {
        await connection.beginTransaction();

        // Get Order ID
        const [orderResult] = await connection.query(`
            SELECT order_id FROM supplier_orders WHERE invoice_number = ?
        `, [invoice_number]);

        if (orderResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Invoice number not found" });
        }

        const order_id = orderResult[0].order_id;

        // If status is 'Completed', insert into inventory_batches
        if (status === 'Completed') {
            const [items] = await connection.query(`
                SELECT product_id, quantity_supplied, unit_cost FROM supplier_order_items 
                WHERE order_id = ?
            `, [order_id]);

            try {
                for (const item of items) {
                    await connection.query(`
                        INSERT INTO inventory_batches (product_id, quantity, cost_per_unit, expiry_date)
                        VALUES (?, ?, ?, ?)
                    `, [
                        item.product_id,
                        item.quantity_supplied,
                        item.unit_cost,
                        expiry_dates?.[item.product_id] || null
                    ]);
                }
            } catch (batchError) {
                await connection.rollback();
                console.error("Error inserting into inventory_batches:", batchError);
                return res.status(500).json({ error: "Failed to insert inventory batches" });
            }
        }

        // Update order status
        await connection.query(`
            UPDATE supplier_orders SET status = ? WHERE order_id = ?
        `, [status, order_id]);

        await connection.commit();
        res.json({ message: "Order status updated successfully" });

    } catch (error) {
        await connection.rollback();
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Failed to update order status" });
    } finally {
        connection.release();
    }
};

// Cancel Supplier Order by Invoice Number
exports.cancelSupplierOrder = async (req, res) => {
    const { invoice_number } = req.params;

    if (!invoice_number) {
        return res.status(400).json({ error: "Invoice number is required" });
    }

    try {
        const [result] = await db.query(`
            UPDATE supplier_orders 
            SET status = 'Cancelled'
            WHERE invoice_number = ?
        `, [invoice_number]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Invoice number not found" });
        }

        res.json({ message: "Order cancelled successfully" });

    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ error: "Failed to cancel order" });
    }
};


//View Historical Orders
exports.getHistoricalOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT * FROM supplier_orders WHERE status IN ('Completed', 'Cancelled')
        `);
        res.json(orders);
    } catch (error) {
        console.error("Error fetching historical orders:", error);
        res.status(500).json({ error: "Failed to fetch historical orders" });
    }
};

// Search orders by date range, status, supplier name, or invoice number
exports.searchOrders = async (req, res) => {
    const { start_date, end_date, status, supplier_name, invoice_number } = req.query;

    let query = `
        SELECT 
            so.order_id, s.supplier_name, so.total_cost, 
            so.status, so.order_date, st.invoice_number
        FROM supplier_orders so
        JOIN suppliers s ON so.supplier_id = s.supplier_id
        LEFT JOIN sales_transactions st ON so.order_id = st.transaction_id
        WHERE 1=1
    `;
    let values = [];

    // Filter by Date Range
    if (start_date && end_date) {
        query += ` AND DATE(so.order_date) BETWEEN ? AND ?`;
        values.push(start_date, end_date);
    }

    // Filter by Status
    if (status) {
        query += ` AND so.status = ?`;
        values.push(status);
    }

    // Filter by Supplier Name (Partial Match)
    if (supplier_name) {
        query += ` AND s.supplier_name LIKE ?`;
        values.push(`%${supplier_name}%`);
    }

    // Filter by Invoice Number (Exact Match)
    if (invoice_number) {
        query += ` AND st.invoice_number = ?`;
        values.push(invoice_number);
    }

    // Final Ordering
    query += ` ORDER BY so.order_date DESC`;

    try {
        const [orders] = await db.query(query, values);
        res.json(orders);
    } catch (error) {
        console.error("Failed to search orders:", error);
        res.status(500).json({ error: "Failed to search orders" });
    }
};

// Track orders by invoice number
exports.trackSupplierOrder = async (req, res) => {
    try {
        const { invoice_number } = req.params; // Extract from URL

        if (!invoice_number) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        console.log("Received params:", req.params); // Debugging

        // Fetch order details from the database
        const [order] = await db.query(
            "SELECT invoice_number, supplier_id, total_cost, order_date, status, processed_by FROM supplier_orders WHERE invoice_number = ?",
            [invoice_number]
        );

        if (!order || order.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error("Error tracking order:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getItemsFromInvoice = async (req, res) => {
    const { invoice_number } = req.params;

    if (!invoice_number) {
        return res.status(400).json({ error: "Invoice number is required" });
    }

    try {
        // Get Order ID based on the Invoice Number
        const [orderResult] = await db.query(
            `SELECT order_id FROM supplier_orders WHERE invoice_number = ?`,
            [invoice_number]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({ error: "Invoice number not found" });
        }

        const order_id = orderResult[0].order_id;

        // Fetch order items
        const [items] = await db.query(
            `SELECT soi.product_id, p.product_name, soi.quantity_supplied, soi.unit_cost 
             FROM supplier_order_items soi 
             JOIN products p ON soi.product_id = p.product_id 
             WHERE soi.order_id = ?`,
            [order_id]
        );

        if (items.length === 0) {
            return res.json({ message: "No items found for this invoice" });
        }

        res.json({ invoice_number, items });
    } catch (error) {
        console.error("Error fetching items from invoice:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Fetch products that crossed stock threshold and auto place order
exports.getStockAlertProducts = async (req, res) => {
    try {
        // 1. Fetch products that crossed the minimum stock threshold
        const query = `
            SELECT 
                p.product_id, p.product_name, p.reorder_level, 
                p.supplier_id, p.unit, p.reorder_level - IFNULL(SUM(i.quantity), 0) AS required_quantity
            FROM products p
            LEFT JOIN inventory_batches i ON p.product_id = i.product_id
            GROUP BY p.product_id
            HAVING required_quantity > 0
        `;
        const [products] = await db.query(query);

        if (products.length === 0) {
            return res.json({ message: "No product has crossed the minimum stock threshold." });
        }

        // 2. Automatically place orders to supplier for low-stock products
        for (let product of products) {
            // Check if an unfulfilled order already exists for the product
            const checkOrderQuery = `
                SELECT * FROM supplier_orders 
                WHERE supplier_id = ? 
                AND order_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
                AND status IN ('Pending', 'Completed')
                AND order_id IN (
                    SELECT order_id FROM supplier_order_items WHERE product_id = ?
                )
            `;
            const [existingOrder] = await db.query(checkOrderQuery, [product.supplier_id, product.product_id]);

            // If an existing pending/completed order exists, skip creating a new order
            if (existingOrder.length > 0) {
                console.log(`Order already exists for Product ID: ${product.product_id}`);
                continue;
            }

            // 3. Insert new order into supplier_orders
            const insertOrderQuery = `
                INSERT INTO supplier_orders (supplier_id, total_cost, status, processed_by)
                VALUES (?, 0.00, 'Pending', NULL)
            `;
            const [orderResult] = await db.query(insertOrderQuery, [product.supplier_id]);

            const orderId = orderResult.insertId;

            // 4. Insert order items for the respective product
            const insertOrderItemQuery = `
                INSERT INTO supplier_order_items (
                    order_id, product_id, quantity_supplied, unit_cost
                )
                VALUES (?, ?, ?, (SELECT purchase_rate FROM inventory_batches WHERE product_id = ? LIMIT 1))
            `;
            await db.query(insertOrderItemQuery, [
                orderId,
                product.product_id,
                product.required_quantity,
                product.product_id
            ]);

            console.log(`Order placed for Product ID: ${product.product_id}`);
        }

        res.json({
            message: "Stock alerts processed. Auto orders placed successfully.",
            productsOrdered: products.length
        });
    } catch (error) {
        console.error("Failed to fetch stock alerts and auto-place orders:", error);
        res.status(500).json({ error: "Failed to fetch stock alerts or auto-place orders." });
    }
};
