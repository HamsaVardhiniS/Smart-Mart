import React from "react";
import { useNavigate } from "react-router-dom";

const BusinessHeadPage = () => {
    const navigate = useNavigate();

    const handlePowerBIRedirect = () => {
        window.open("https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID", "_blank");
    };

    return (
        <div className="business-head-container">
            <h1>Business Head Dashboard</h1>

            <section>
                <h2>📊 Sales Reports</h2>
                <ul>
                    <li>Daily Sales Report</li>
                    <li>Monthly Sales Report</li>
                    <li>Yearly Sales Report</li>
                </ul>
            </section>

            <section>
                <h2>👨‍💼 Employee Reports</h2>
                <ul>
                    <li>Performance Tracking</li>
                    <li>Attendance & Payroll</li>
                </ul>
            </section>

            <section>
                <h2>📈 Sales Optimization</h2>
                <ul>
                    <li>Dynamic Pricing</li>
                    <li>Sales Forecasting (ARIMA/Prophet)</li>
                    <li>Seasonal Discounts</li>
                    <li>Cost Modeling & Break-even Analysis</li>
                </ul>
            </section>

            <section>
                <h2>📦 Inventory & Supply Chain Optimization</h2>
                <ul>
                    <li>Supplier Performance Analysis</li>
                    <li>Supply Chain Cost Optimization</li>
                </ul>
            </section>

            <section>
                <h2>🛒 Waste Detection & Discounts</h2>
                <ul>
                    <li>Identify Expiring Products</li>
                    <li>Auto-Apply Discounts</li>
                </ul>
            </section>

            <section>
                <h2>👥 Staff Scheduling</h2>
                <ul>
                    <li>Optimize Shifts Based on Foot Traffic</li>
                </ul>
            </section>

            <section>
                <h2>📢 Marketing & Customer Retention</h2>
                <ul>
                    <li>Personalized Discounts & Promotions</li>
                    <li>Ad Campaign ROI Analysis</li>
                    <li>Customer Loyalty Program</li>
                </ul>
            </section>

            <section>
                <h2>🚀 Power BI Integration</h2>
                <button className="powerbi-btn" onClick={handlePowerBIRedirect}>
                    View Power BI Reports
                </button>
            </section>
        </div>
    );
};

export default BusinessHeadPage;
