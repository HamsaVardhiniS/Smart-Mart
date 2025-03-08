import React, { useState, useEffect } from "react";
import axios from "axios";

const InventoryPage = () => {
    const [selectedSection, setSelectedSection] = useState("dashboard");

    return (
        <div className="inventory-container">
            <aside className="sidebar">
                <h2>Inventory</h2>
                <button onClick={() => setSelectedSection("dashboard")}>Dashboard</button>
                <button onClick={() => setSelectedSection("updateProduct")}>Update Product</button>
                <button onClick={() => setSelectedSection("manageSuppliers")}>Manage Suppliers</button>
                <button onClick={() => setSelectedSection("manageOrders")}>Manage Orders</button>
            </aside>

            <main className="content">
                {selectedSection === "dashboard" && <ProductDashboard />}
                {selectedSection === "manageSuppliers" && <ManageSuppliers />}
                {selectedSection === "manageOrders" && <ManageOrders />}
                {selectedSection === "updateProduct" && <UpdateProduct />}
            </main>
        </div>
    );
};

/* ✅ Product Dashboard (Schema Compliant) */
const ProductDashboard = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInventoryProducts();
    }, [searchQuery]); // Runs when searchQuery changes
    
    const fetchInventoryProducts = async () => {
        setLoading(true);
        try {
            let url = "http://localhost:5000/inventory/products";
    
            // If searchQuery exists, modify the URL
            if (searchQuery.trim() !== "") {
                url = `http://localhost:5000/inventory/products/search?query=${searchQuery}`;
            }
    
            const response = await axios.get(url);
            console.log("Fetched Products:", response.data); // Debugging line
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="dashboard">
            <h2>Product Inventory</h2>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Loading State */}
            {loading && <p>Loading products...</p>}

            {/* Product Table */}
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Batch ID</th>
                        <th>Stock Quantity</th>
                        <th>Reorder Level</th>
                        <th>Purchase Price</th>
                        <th>Selling Price</th>
                        <th>Expiration Date</th>
                        <th>Stock Alert</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.batch_id}>
                                <td>{product.product_name || "N/A"}</td>
                                <td>{product.category_name || "N/A"}</td>
                                <td>{product.brand_name || "N/A"}</td>
                                <td>{product.batch_id || "N/A"}</td>
                                <td>{product.stock_quantity || 0}</td>
                                <td>{product.reorder_level || 0}</td>
                                <td>₹{product.purchase_price?.toFixed(2) || "N/A"}</td>
                                <td>₹{product.selling_price?.toFixed(2) || "N/A"}</td>
                                <td>{product.expiration_date ? new Date(product.expiration_date).toLocaleDateString() : "N/A"}</td>
                                <td style={{ color: product.stock_threshold_alert ? "red" : "green" }}>
                                    {product.stock_threshold_alert ? "⚠ Low Stock" : "✔ OK"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10">No products found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

/* ✅ Manage Suppliers (Schema Compliant) */
const ManageSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        supplier_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        country: "",
        gst_number: "",
        status: "Active",
    });

    useEffect(() => {
        fetchSuppliers();
    }, [searchQuery]); // Fetch suppliers when searchQuery changes

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const url = searchQuery 
                ? `http://localhost:5000/inventory/suppliers?search=${searchQuery}`
                : `http://localhost:5000/inventory/suppliers`; // Fetch all suppliers if no search query
    
            const response = await axios.get(url);
            setSuppliers(response.data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        } finally {
            setLoading(false);
        }
    };
    

    const handleAddSupplier = async () => {
        try {
            await axios.post("http://localhost:5000/inventory/suppliers", newSupplier);
            setShowModal(false);
            fetchSuppliers(); // Refresh supplier list
            setNewSupplier({
                supplier_name: "",
                contact_person: "",
                phone: "",
                email: "",
                address: "",
                city: "",
                country: "",
                gst_number: "",
                status: "Active",
            });
        } catch (error) {
            console.error("Error adding supplier:", error);
        }
    };

    return (
        <div>
            <h2>Manage Suppliers</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => setShowModal(true)} style={{ padding: "5px 10px", fontSize: "16px" }}>➕</button>
            </div>

            {loading ? <p>Loading...</p> : (
                <table border="1" style={{ width: "100%", marginTop: "20px" }}>
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Contact Person</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>GST Number</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                                <tr key={supplier.supplier_id}>
                                    <td>{supplier.supplier_name}</td>
                                    <td>{supplier.contact_person}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.email}</td>
                                    <td>{supplier.gst_number}</td>
                                    <td>{supplier.city}</td>
                                    <td>{supplier.country}</td>
                                    <td>{supplier.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">No suppliers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Modal Form */}
            {showModal && (
                <div style={{
                    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    background: "white", padding: "20px", borderRadius: "5px", boxShadow: "0px 0px 10px gray"
                }}>
                    <h3>Add Supplier</h3>
                    <input type="text" placeholder="Supplier Name" value={newSupplier.supplier_name} onChange={(e) => setNewSupplier({ ...newSupplier, supplier_name: e.target.value })} />
                    <input type="text" placeholder="Contact Person" value={newSupplier.contact_person} onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })} />
                    <input type="text" placeholder="Phone" value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
                    <input type="email" placeholder="Email" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                    <input type="text" placeholder="Address" value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} />
                    <input type="text" placeholder="City" value={newSupplier.city} onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })} />
                    <input type="text" placeholder="Country" value={newSupplier.country} onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })} />
                    <input type="text" placeholder="GST Number" value={newSupplier.gst_number} onChange={(e) => setNewSupplier({ ...newSupplier, gst_number: e.target.value })} />

                    <button onClick={handleAddSupplier}>Submit</button>
                    <button onClick={() => setShowModal(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

/* ✅ Manage Orders (Placeholder) */
const ManageOrders = () => {
    return (
        <div className="manage-orders">
            <h2>Manage Orders</h2>
            <p>Order management functionality coming soon...</p>
        </div>
    );
};

/* ✅ Update Product (Placeholder) */
const UpdateProduct = () => {
    const [product, setProduct] = useState({
        product_id: "",
        product_name: "",
        brand_id: "",
        category_id: "",
        subcategory_id: "",
        unit: "",
        reorder_level: "",
        stock_threshold_alert: "",
        tax_percentage: ""
    });

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:3000/api/products/${product.product_id}`, product);
            alert("Product updated successfully!");
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    return (
        <div className="update-product">
            <h2>Update Product</h2>
            <input type="text" name="product_id" placeholder="Product ID" onChange={handleChange} />
            <input type="text" name="product_name" placeholder="Product Name" onChange={handleChange} />
            <button onClick={handleUpdate}>Update</button>
        </div>
    );
};


export default InventoryPage;
