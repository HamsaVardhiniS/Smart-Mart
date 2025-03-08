CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    gst_number VARCHAR(50) UNIQUE,
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('Cashier', 'Inventory Manager', 'Admin', 'HR Manager', 'Business Head'),   
    department_id INT,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    address TEXT,
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    emergency_contact VARCHAR(20),
    hire_date DATE,                                                         
    shift ENUM('Morning', 'Evening', 'Night'),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    password_hash VARCHAR(255),
    
    bank_account_number VARCHAR(50) NOT NULL UNIQUE,
    bank_name VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,  
    account_holder_name VARCHAR(255) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    salary_mode ENUM('Bank Transfer', 'Cheque', 'UPI', 'Cash') DEFAULT 'Bank Transfer',
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) UNIQUE NOT NULL,
    manager_id INT NULL
);

CREATE TABLE product_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE product_subcategories (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    subcategory_name VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id) ON DELETE CASCADE
);

CREATE TABLE brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(255) UNIQUE NOT NULL,
    supplier_id INT,  -- If brands are linked to suppliers
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    brand_id INT,  -- References the brand table
    category_id INT NOT NULL,  -- References the category table
    subcategory_id INT,  -- References the subcategory table
    unit VARCHAR(50),  -- e.g., kg, liter, piece
    reorder_level INT DEFAULT 10,  -- Minimum stock threshold
	stock_threshold_alert BOOLEAN DEFAULT FALSE, -- New column for stock alerts
    tax_percentage DECIMAL(5,2),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES product_subcategories(subcategory_id) ON DELETE CASCADE
);


CREATE TABLE inventory_batches (
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    supplier_id INT,  -- NEW: Tracks which supplier supplied this batch
    quantity INT CHECK (quantity >= 0),
    expiry_date DATE,
    cost_per_unit DECIMAL(10,2), -- NEW: Stores cost per unit for this batch
    purchase_rate DECIMAL(10,2),
    mrp DECIMAL(10,2),
    sales_rate DECIMAL(10,2),
    date_received TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
);


CREATE TABLE sales_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL, -- Invoice number for billing
    customer_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    other_discount DECIMAL(10,2) DEFAULT 0.00, -- Discounts applied
    tax_amount DECIMAL(10,2) DEFAULT 0.00, -- Taxes applied
	net_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - other_discount + tax_amount) STORED,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Wallet', 'Store Credit', 'Gift Card', 'Mixed'),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INT,  -- Employee ID (Cashier)
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES employees(employee_id) ON DELETE SET NULL
);


CREATE TABLE sales_items (
    sales_item_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    product_id INT,
    batch_id INT, -- Track which batch was sold
    quantity_sold INT CHECK (quantity_sold > 0),
    selling_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00, -- Item-level discount
    total_price DECIMAL(10,2) GENERATED ALWAYS AS ((quantity_sold * selling_price) - discount) STORED, -- Auto-calculated
    FOREIGN KEY (transaction_id) REFERENCES sales_transactions(transaction_id) ON DELETE CASCADE,
	FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES inventory_batches(batch_id) ON DELETE SET NULL
);

CREATE TABLE supplier_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL, -- Total cost of the order
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending', -- Track order progress
    processed_by INT, -- Employee who placed the order
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE TABLE supplier_order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_supplied INT CHECK (quantity_supplied > 0), -- Ordered quantity
    quantity_received INT CHECK (quantity_received >= 0) DEFAULT 0, -- Actual received quantity
    unit_cost DECIMAL(10,2) NOT NULL, -- Cost per unit at the time of supply
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_supplied * unit_cost) STORED, -- Auto-calculated
    batch_id INT NULL, -- Link to batch tracking (NULL initially)
    expiry_date DATE NULL, -- Expiry (NULL for non-perishables)
    FOREIGN KEY (order_id) REFERENCES supplier_orders(order_id) ON DELETE CASCADE,	
	FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES inventory_batches(batch_id) ON DELETE CASCADE
);

CREATE TABLE login_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    email VARCHAR(255) NOT NULL,
    status ENUM('Success', 'Failed') NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE TABLE supplier_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity_supplied INT NOT NULL,
    supplier_id INT NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,  -- Default 5% tax
    discount_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,  -- Default 10% discount
    payment_methods JSON NOT NULL,
    CHECK (JSON_VALID(payment_methods)) -- Ensure it's valid JSON
);

CREATE TABLE email_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INT NOT NULL,
    smtp_user VARCHAR(255) NOT NULL,
    smtp_pass VARCHAR(255) NOT NULL
);

CREATE TABLE customer_feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id)
        ON DELETE CASCADE
);

DELIMITER //

-- TRIGGER: Deduct Inventory Using FIFO on Sales
CREATE TRIGGER deduct_inventory_fifo
AFTER INSERT ON sales_items
FOR EACH ROW
BEGIN
    DECLARE remaining_qty INT;
    DECLARE batch_id INT;
    DECLARE qty_to_deduct INT;
    DECLARE batch_cursor CURSOR FOR 
        SELECT batch_id, quantity FROM inventory_batches 
        WHERE product_id = NEW.product_id AND quantity > 0 
        ORDER BY expiry_date ASC; -- FIFO by expiry date

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET batch_id = NULL;

    SET qty_to_deduct = NEW.quantity_sold;
    
    OPEN batch_cursor;
    batch_loop: LOOP
        FETCH batch_cursor INTO batch_id, remaining_qty;
        IF batch_id IS NULL OR qty_to_deduct <= 0 THEN 
            LEAVE batch_loop;
        END IF;

        IF qty_to_deduct <= remaining_qty THEN
            UPDATE inventory_batches 
            SET quantity = quantity - qty_to_deduct
            WHERE batch_id = batch_id;
            SET qty_to_deduct = 0;
        ELSE
            UPDATE inventory_batches 
            SET quantity = 0 
            WHERE batch_id = batch_id;
            SET qty_to_deduct = qty_to_deduct - remaining_qty;
        END IF;
    END LOOP;
    CLOSE batch_cursor;
END;
//

-- TRIGGER: Auto Reorder When Inventory is Low
CREATE TRIGGER auto_reorder
AFTER UPDATE ON inventory_batches
FOR EACH ROW
BEGIN
    DECLARE reorder_needed INT;
    DECLARE reorder_level INT;
    
    SELECT SUM(quantity) INTO reorder_needed 
    FROM inventory_batches 
    WHERE product_id = NEW.product_id;
    
    SELECT reorder_level INTO reorder_level 
    FROM products 
    WHERE product_id = NEW.product_id;
    
    IF reorder_needed < reorder_level THEN
        INSERT INTO supplier_orders (supplier_id, total_cost, status, processed_by)
        VALUES (
            (SELECT supplier_id FROM products WHERE product_id = NEW.product_id),
            0.00, 'Pending', NULL);
    END IF;
END;
//

-- PROCEDURE: Restock a Product
CREATE PROCEDURE RestockProduct(
    IN productId INT, IN supplierId INT, IN quantity INT, 
    IN cost DECIMAL(10,2), IN expiry DATE
)
BEGIN
    INSERT INTO inventory_batches (product_id, supplier_id, quantity, cost_per_unit, expiry_date)
    VALUES (productId, supplierId, quantity, cost, expiry);
    
    UPDATE products SET last_updated = NOW() WHERE product_id = productId;
END;
//

-- PROCEDURE: Generate Sales Report (Daily, Monthly, Yearly)
CREATE PROCEDURE GetSalesReport(
    IN report_type ENUM('DAILY', 'MONTHLY', 'YEARLY'),
    IN report_date DATE
)
BEGIN
    DECLARE start_date DATE;
    DECLARE end_date DATE;

    IF report_type = 'DAILY' THEN
        SET start_date = report_date;
        SET end_date = report_date;
    ELSEIF report_type = 'MONTHLY' THEN
        SET start_date = DATE_FORMAT(report_date, '%Y-%m-01');
        SET end_date = LAST_DAY(report_date);
    ELSEIF report_type = 'YEARLY' THEN
        SET start_date = DATE_FORMAT(report_date, '%Y-01-01');
        SET end_date = DATE_FORMAT(report_date, '%Y-12-31');
    END IF;

    SELECT 
        COUNT(st.transaction_id) AS total_transactions,
        SUM(st.total_amount) AS total_sales_revenue,
        SUM(st.tax_amount) AS total_tax_collected,
        SUM(st.other_discount) AS total_discounts_applied,
        SUM(st.net_amount) AS net_revenue
    FROM sales_transactions st
    WHERE st.transaction_date BETWEEN start_date AND end_date;
END;
//

-- TRIGGER: Update Inventory After Supplier Transaction
CREATE TRIGGER after_supplier_transaction_insert
AFTER INSERT ON supplier_transactions
FOR EACH ROW
BEGIN
    UPDATE inventory 
    SET quantity = quantity + NEW.quantity_supplied 
    WHERE product_id = NEW.product_id;
END;
//

-- TRIGGER: Update Inventory After Sale
CREATE TRIGGER after_sales_item_insert
AFTER INSERT ON sales_items
FOR EACH ROW
BEGIN
    UPDATE inventory 
    SET quantity = quantity - NEW.quantity_sold 
    WHERE product_id = NEW.product_id;
END;
//

-- TRIGGER: Create Batch When Supplier Order is Completed
CREATE TRIGGER create_batch_on_order_completion
AFTER UPDATE ON supplier_orders
FOR EACH ROW
BEGIN
    -- Ensure batch creation happens only when the order status changes to 'Completed'
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        INSERT INTO inventory_batches (
            product_id, supplier_id, quantity, cost_per_unit, purchase_rate, mrp, sales_rate, expiry_date
        )
        SELECT 
            soi.product_id, so.supplier_id, soi.quantity_received, soi.unit_cost, 
            soi.unit_cost * 1.1, -- Purchase Rate (10% markup)
            soi.unit_cost * 1.3, -- MRP (30% markup)
            soi.unit_cost * 1.5, -- Sales Rate (50% markup)
            soi.expiry_date
        FROM supplier_order_items soi
        JOIN supplier_orders so ON soi.order_id = so.order_id
        WHERE soi.order_id = NEW.order_id AND soi.quantity_received > 0;
    END IF;
END;
//

-- Reset the delimiter back to semicolon
DELIMITER ;
