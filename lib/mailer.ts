import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Little Steps Pre-Primary" <no-reply@littlesteps.com>',
            to,
            subject,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export const sendOTPRef = async (email: string, otp: string) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1a3f22; text-align: center;">Little Steps Pre-Primary</h2>
      <p>Hello,</p>
      <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; color: #1a3f22; margin: 0;">${otp}</h1>
      </div>
      <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Little Steps Pre-Primary. All rights reserved.</p>
    </div>
  `;
    return sendEmail(email, "Password Reset OTP - Little Steps", html);
};
