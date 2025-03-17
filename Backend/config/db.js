require("dotenv").config();
const mysql = require("mysql2/promise"); // Use mysql2 with promises
const nodemailer = require('nodemailer');
console.log("DB Config:", process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = pool; // Do NOT use .promise()
