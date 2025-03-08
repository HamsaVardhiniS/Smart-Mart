const db = require("../config/db");
const nodemailer = require("nodemailer");

// Generate a unique invoice number
const generateInvoiceNumber = () => {
    return "INV-" + Date.now();
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",  // Replace with your email
        pass: "your-app-password"      // Use an app password, not your actual password
    }
});

// Function to send email
const sendInvoiceEmail = async (customer_email, invoice_number, items, total_amount, payment_method) => {
    const itemList = items.map(item => 
        `<tr>
            <td>${item.product_name}</td>
            <td>${item.quantity_sold}</td>
            <td>$${item.selling_price.toFixed(2)}</td>
            <td>$${(item.quantity_sold * item.selling_price).toFixed(2)}</td>
        </tr>`
    ).join("");

    const emailHTML = `
        <h2>Invoice: ${invoice_number}</h2>
        <p>Thank you for shopping with us!</p>
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price per Unit</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemList}
            </tbody>
        </table>
        <h3>Total Amount: $${total_amount.toFixed(2)}</h3>
        <h4>Payment Method: ${payment_method}</h4>
        <p>We appreciate your business!</p>
    `;

    return transporter.sendMail({
        from: '"Hypermarket Billing" <your-email@gmail.com>',
        to: customer_email,
        subject: `Invoice ${invoice_number}`,
        html: emailHTML
    });
};

// Create a new bill
exports.createBill = async (req, res) => {
    const { customer_email, items, payment_method, processed_by } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "No items provided" });
    }

    try {
        let customer_id;

        // Check if the customer exists
        const [customer] = await db.promise().query(
            "SELECT customer_id FROM customers WHERE email = ?",
            [customer_email]
        );

        if (customer.length === 0) {
            // Insert new customer if not found
            const [newCustomer] = await db.promise().query(
                "INSERT INTO customers (email, registration_date) VALUES (?, NOW())",
                [customer_email]
            );
            customer_id = newCustomer.insertId; // Corrected assignment
        } else {
            customer_id = customer[0].customer_id;
        }

        const invoice_number = generateInvoiceNumber();

        // Insert transaction (without total_amount initially)
        const [transaction] = await db.promise().query(
            "INSERT INTO sales_transactions (invoice_number, customer_id, payment_method, processed_by) VALUES (?, ?, ?, ?)",
            [invoice_number, customer_id, payment_method, processed_by]
        );

        const transaction_id = transaction.insertId;
        let totalAmount = 0;
        const itemQueries = [];
        const detailedItems = [];

        // Prepare item insert queries and collect product details
        for (const item of items) {
            const { product_id, batch_id, quantity_sold, selling_price, discount } = item;
            const total_price = (quantity_sold * selling_price) - discount;

            itemQueries.push(
                db.promise().query(
                    "INSERT INTO sales_items (transaction_id, product_id, batch_id, quantity_sold, selling_price, discount) VALUES (?, ?, ?, ?, ?, ?)",
                    [transaction_id, product_id, batch_id, quantity_sold, selling_price, discount]
                )
            );

            // Fetch product name for email invoice
            const [productDetails] = await db.promise().query(
                "SELECT product_name FROM products WHERE product_id = ?",
                [product_id]
            );

            detailedItems.push({
                product_name: productDetails[0].product_name,
                quantity_sold,
                selling_price
            });

            totalAmount += total_price;
        }

        // Execute all item insert queries in parallel
        await Promise.all(itemQueries);

        // Update total amount in transaction
        await db.promise().query(
            "UPDATE sales_transactions SET total_amount = ? WHERE transaction_id = ?",
            [totalAmount, transaction_id]
        );

        // Send invoice email
        await sendInvoiceEmail(customer_email, invoice_number, detailedItems, totalAmount, payment_method);

        res.status(201).json({ message: "Bill created successfully and invoice sent!", invoice_number, transaction_id });

    } catch (error) {
        console.error("Error creating bill:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Fetch previous bill history
exports.getBillHistory = async (req, res) => {
    try {
        const [transactions] = await db.promise().query(
            "SELECT * FROM sales_transactions ORDER BY transaction_date DESC"
        );
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching bill history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get stock details
exports.getStockDetails = async (req, res) => {
    try {
        const [stock] = await db.promise().query(
            "SELECT p.product_id, p.product_name, ib.batch_id, ib.quantity_available, ib.expiry_date " +
            "FROM products p JOIN inventory_batches ib ON p.product_id = ib.product_id"
        );
        res.json(stock);
    } catch (error) {
        console.error("Error fetching stock:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Store customer feedback
exports.storeFeedback = async (req, res) => {
    const { customer_id, rating, comments } = req.body;

    if (!customer_id || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await db.promise().query(
            "INSERT INTO customer_feedback (customer_id, rating, comments) VALUES (?, ?, ?)",
            [customer_id, rating, comments]
        );

        res.status(201).json({ message: "Feedback submitted" });
    } catch (error) {
        console.error("Error storing feedback:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
