import React, { useState, useEffect } from "react";
import axios from "axios";

const CashierPage = () => {
    const [customerEmail, setCustomerEmail] = useState("");
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [transactionId, setTransactionId] = useState(null);
    const [billHistory, setBillHistory] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3000/api/cashier/stock")
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));

        axios.get("http://localhost:3000/api/cashier/bill-history")
            .then(response => setBillHistory(response.data))
            .catch(error => console.error("Error fetching bill history:", error));
    }, []);

    // Create a new bill
    const createBill = () => {
        axios.post("http://localhost:3000/api/cashier/create-bill", { customer_email: customerEmail, processed_by: 1 })
            .then(response => {
                setTransactionId(response.data.transaction_id);
                alert("Bill created successfully!");
            })
            .catch(error => console.error("Error creating bill:", error));
    };

    // Add selected products to bill
    const addProductsToBill = () => {
        if (!transactionId) {
            alert("Please create a bill first.");
            return;
        }
        axios.post("http://localhost:3000/api/cashier/add-products", { transaction_id: transactionId, products: selectedProducts })
            .then(() => {
                alert("Products added successfully!");
                setSelectedProducts([]); // Clear selection
            })
            .catch(error => console.error("Error adding products:", error));
    };

    // Handle product selection
    const handleProductSelect = (e) => {
        const product = JSON.parse(e.target.value);
        setSelectedProduct(product);
    };

    // Add selected product to the list
    const addSelectedProduct = () => {
        if (selectedProduct) {
            setSelectedProducts([...selectedProducts, selectedProduct]);
        }
    };

    return (
        <div className="cashier-page">
            <h2>Cashier Billing</h2>

            <h3>Enter Customer Email</h3>
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            <button onClick={createBill}>Create Bill</button>

            <h3>Select Products</h3>
            <select onChange={handleProductSelect}>
                <option>Select Product</option>
                {products.map(product => (
                    <option key={product.product_id} value={JSON.stringify(product)}>
                        {product.product_name} - ${product.price}
                    </option>
                ))}
            </select>
            <button onClick={addSelectedProduct}>Add Product</button>

            <h4>Selected Products:</h4>
            <ul>
                {selectedProducts.map((prod, index) => (
                    <li key={index}>{prod.product_name} - ${prod.price}</li>
                ))}
            </ul>
            <button onClick={addProductsToBill}>Add Products to Bill</button>

            <h3>Previous Bill History</h3>
            <ul>
                {billHistory.map(bill => (
                    <li key={bill.transaction_id}>{bill.invoice_number} - ${bill.total_amount}</li>
                ))}
            </ul>
        </div>
    );
};

export default CashierPage;
