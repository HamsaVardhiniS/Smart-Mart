const db = require("../config/db");

// ✅ 1. Fetch all suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM suppliers");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ 2. Add a new supplier
exports.addSupplier = async (req, res) => {
    try {
        const { supplier_name, contact_person, phone, email, address } = req.body;

        const result = await db.query(
            `INSERT INTO suppliers (supplier_name, contact_person, phone, email, address)
             VALUES (?, ?, ?, ?, ?)`,
            [supplier_name, contact_person, phone, email, address]
        );

        res.json({ message: "Supplier added successfully", supplier_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
