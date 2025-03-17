import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Modal, Input, Select, message } from 'antd';

const InventoryPage = () => {
    const [selectedSection, setSelectedSection] = useState("dashboard");

    return (
        <div className="inventory-container">
            <aside className="sidebar">
                <h2>Inventory</h2>
                <button onClick={() => setSelectedSection("dashboard")}>Stock view</button>
                <button onClick={() => setSelectedSection("updateProduct")}>Manage Product</button>
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
    },[]);
       

    const fetchInventoryProducts = async () => {
        setLoading(true);
        try {
            let url = "http://localhost:5000/api/inventory/products";
    
            // If searchQuery exists, modify the URL
            if (searchQuery.trim() !== "") {
                url = `http://localhost:5000/api/inventory/products/search?query=${encodeURIComponent(searchQuery)}`;
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
            <h2>Inventory</h2>

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
     // Fetch suppliers when searchQuery changes

     useEffect(() => {
        fetchSuppliers();
    },[]);


    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const url = searchQuery 
                ? `http://localhost:5000/api/inventory/suppliers?search=${searchQuery}`
                : `http://localhost:5000/api/inventory/suppliers`; // Fetch all suppliers if no search query
    
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
            await axios.post("http://localhost:5000/api/inventory/suppliers", newSupplier);
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


const ManageOrders = () => {
    const [products, setProducts] = useState([]);
    const [currentOrders, setCurrentOrders] = useState([]);
    const [orderHistory, setHistoricalOrders] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [processedBy] = useState('Admin');
    const [trackOrderId, setTrackOrderId] = useState('');
    const [orderStatus, setOrderStatus] = useState('');

    // ✅ Load Data on Component Mount
    useEffect(() => {
        fetchProducts();
        fetchCurrentOrders();
        fetchHistoricalOrders();
    }, []);

    // ✅ Fetch Products
    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/inventory/products');
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    // ✅ Fetch Current Orders
    const fetchCurrentOrders = async () => {
        try {
            const res = await axios.get('/api/inventory/current-orders');
            setCurrentOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch current orders", error);
        }
    };

    // ✅ Fetch Order History
    const fetchHistoricalOrders = async () => {
        try {
            const res = await axios.get('/api/inventory/historical-orders') ;
            setHistoricalOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch historical orders", error);
        }
    };

    // ✅ Add Product to Order
    const handleAddProduct = (product_id, quantity) => {
        const product = products.find(p => p.product_id === product_id);
        const isExist = selectedProducts.some(p => p.product_id === product_id);

        if (!isExist) {
            setSelectedProducts([...selectedProducts, {
                product_id: product.product_id,
                product_name: product.product_name,
                unit_cost: product.unit_cost,
                quantity: quantity
            }]);
        }
    };

    // ✅ Place Order
    const handlePlaceOrder = async () => {
        if (!supplierId || selectedProducts.length === 0) {
            message.error('Supplier and products are required');
            return;
        }
        try {
            await axios.post('/api/inventory/supplier-orders', {
                supplier_id: supplierId,
                products: selectedProducts,
                processed_by: processedBy
            });
            message.success('Order placed successfully');
            setVisible(false);
            fetchCurrentOrders();
            setSelectedProducts([]);
        } catch (error) {
            message.error('Failed to place order');
        }
    };

    // ✅ Track Order
    const handleTrackOrder = async () => {
        if (!trackOrderId) {
            message.error('Please enter an Order ID');
            return;
        }
        try {
            const res = await axios.get(`/api/inventory/supplier-orders/${trackOrderId}/track`);
            setOrderStatus(res.data.status);
        } catch (error) {
            message.error('Failed to track order');
            setOrderStatus('Not Found');
        }
    };

    // ✅ Update Order Status
    const handleUpdateStatus = async (order_id, status) => {
        try {
            await axios.put(`/api/inventory/supplier-orders/${order_id}/status`, { status });
            message.success('Order status updated');
            fetchCurrentOrders();
            fetchHistoricalOrders();
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    return (
        <div>
            {/* ✅ Track Order Section */}
            <h2>📍 Track Order</h2>
            <Input
                placeholder="Enter Order ID"
                value={trackOrderId}
                onChange={(e) => setTrackOrderId(e.target.value)}
                style={{ width: '300px', marginRight: '10px' }}
            />
            <Button onClick={handleTrackOrder} type="primary">Track</Button>

            {/* ✅ Show Order Status */}
            {orderStatus && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '300px' }}>
                    <strong>Order ID:</strong> {trackOrderId} <br />
                    <strong>Status:</strong>
                    <span style={{ color: orderStatus === 'Completed' ? 'green' : orderStatus === 'Cancelled' ? 'red' : 'blue' }}>
                        {orderStatus}
                    </span>
                </div>
            )}

            {/* ✅ Create Order Button */}
            <Button type="primary" onClick={() => setVisible(true)} style={{ float: 'right', marginBottom: '20px' }}>
                + Create Order
            </Button>

            {/* ✅ Current Orders Table */}
            <h2>🟢 Current Orders</h2>
            <Table 
                dataSource={currentOrders} 
                rowKey="order_id"
                columns={[
                    { title: 'Order ID', dataIndex: 'order_id' },
                    { title: 'Supplier', dataIndex: 'supplier_name' },
                    { title: 'Total Cost', dataIndex: 'total_cost' },
                    { title: 'Status', dataIndex: 'status' },
                    {
                        title: 'Action',
                        render: (_, record) => (
                            <>
                                <Button onClick={() => handleUpdateStatus(record.order_id, 'Completed')}>
                                    ✅ Mark as Received
                                </Button>
                                <Button onClick={() => handleUpdateStatus(record.order_id, 'Cancelled')} danger>
                                    ❌ Cancel
                                </Button>
                            </>
                        )
                    }
                ]}
            />

            {/* ✅ Order History Table */}
            <h2>📜 Order History</h2>
            <Table dataSource={orderHistory} rowKey="order_id"
                columns={[
                    { title: 'Order ID', dataIndex: 'order_id' },
                    { title: 'Supplier', dataIndex: 'supplier_name' },
                    { title: 'Total Cost', dataIndex: 'total_cost' },
                    { title: 'Status', dataIndex: 'status' },
                    { title: 'Date Placed', dataIndex: 'order_date' }
                ]}
            />

            {/* ✅ Create Order Modal */}
            <Modal
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={handlePlaceOrder}
                title="Create New Order"
            >
                <h3>Supplier ID</h3>
                <Input 
                    placeholder="Supplier ID" 
                    value={supplierId} 
                    onChange={(e) => setSupplierId(e.target.value)} 
                />

                <h3>Select Products</h3>
                <Select
    style={{ width: '100%' }}
    onChange={(product_id) => handleAddProduct(product_id, 1)}
>
    {products
        .filter(p => p.product_id) // Ensure product_id is valid
        .map(p => (
            <Select.Option key={p.product_id} value={p.product_id}>
                {p.product_name}
            </Select.Option>
        ))}
</Select>

                <h3>Selected Products</h3>
                {selectedProducts.map(p => (
                    <div key={p.product_id}>
                        {p.product_name} - Qty: {p.quantity} - ${p.unit_cost}
                    </div>
                ))}

                <Button onClick={handlePlaceOrder} type="primary">✅ Confirm Order</Button>
            </Modal>
        </div>
    );
};


const UpdateProduct = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productDetails, setProductDetails] = useState({
        product_name: '',
        brand_id: '',
        category_id: '',
        subcategory_id: '',
        reorder_level: ''
    });

    // Fetch products when page loads
    useEffect(() => {
        fetchProducts();
    }, []);

    // ✅ Fetch product list to populate dropdown
    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/inventory/products');
            if (res.data.length > 0) {
                setProducts(res.data);
                console.log('Fetched Products:', res.data);
            } else {
                message.info('No products available');
            }
        } catch (error) {
            message.error('Failed to fetch products');
        }
    };

    // ✅ Handle product selection and fetch details
    const handleSelect = async (productId) => {
        setProductDetails({
            product_name: '',
            brand_id: '',
            category_id: '',
            subcategory_id: '',
            reorder_level: ''
        });
        
        try {
            const res = await axios.get(`/api/inventory/products/${productId}`);
            setProductDetails(res.data);
            setSelectedProduct(productId);
            if (!res.data) {
                message.warning('Product not found');
                return;
            }
            
        } catch (error) {
            message.error('Failed to fetch product details');
        }
    };

    // ✅ Handle input change
    const handleChange = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    // ✅ Update product details
    const handleUpdate = async () => {
        try {
            await axios.put(`/api/inventory/products/${selectedProduct}`, productDetails);
            message.success('Product updated successfully!');
            fetchProducts();  // Refresh the dropdown
        } catch (error) {
            message.error('Failed to update product');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Update Product</h2>

            {/* ✅ Product Selection Dropdown */}
            <Select
                showSearch
                placeholder="Search or select product"
                optionFilterProp="children"
                onChange={handleSelect}
                style={{ width: 300, marginBottom: '20px' }}
            >
               {products
  .filter(product => product.product_id) // Prevent null IDs
  .map(product => (
    <Select.Option key={product.product_id} value={product.product_id}>
        {product.product_name}
    </Select.Option>
))}

            </Select>

            {/* ✅ Product Details Form */}
            {selectedProduct && (
                <div style={{ marginTop: '20px' }}>
                    <Input name="product_name" value={productDetails.product_name} onChange={handleChange} placeholder="Product Name" />
                    <Input name="brand_id" value={productDetails.brand_id} onChange={handleChange} placeholder="Brand ID" />
                    <Input name="category_id" value={productDetails.category_id} onChange={handleChange} placeholder="Category ID" />
                    <Input name="subcategory_id" value={productDetails.subcategory_id} onChange={handleChange} placeholder="Subcategory ID" />
                    <Input name="reorder_level" value={productDetails.reorder_level} onChange={handleChange} placeholder="Reorder Level" />
                    <Button type="primary" onClick={handleUpdate} style={{ marginTop: '10px' }}>
                        Update Product
                    </Button>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
