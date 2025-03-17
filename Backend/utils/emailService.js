const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Your email (set in `.env`)
        pass: process.env.EMAIL_PASS   // Your password (set in `.env`)
    }
});

const sendEmailWithAttachment = async (recipientEmail, subject, body, filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error("Attachment file not found.");
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: subject,
            text: body,
            attachments: [
                {
                    filename: filePath.split('/').pop(),
                    path: filePath
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`📩 Payslip sent successfully to ${recipientEmail}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
};

module.exports = { sendEmailWithAttachment };
