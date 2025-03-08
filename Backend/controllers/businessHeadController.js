const db = require("../config/db");

exports.getDashboard = (req, res) => {
    res.json({ message: "Welcome to the Business Head Dashboard" });
};
