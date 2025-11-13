import transporter from "../config/email.js"
import EmailVerificationModel from "../models/otpModel.js";


const sendEmailVerificationOTP = async (user) => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP in DB
    const savedOtp = await new EmailVerificationModel({
      userId: user._id,
      otp,
    }).save();

    console.log("OTP saved:", savedOtp);

    // Send email
    await transporter.sendMail({
      from: `"Placerly" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "OTP - Verify your account",
      html: `
        <p>Dear ${user.name},</p>
        <p>Thank you for signing up with our website. To complete your registration, please verify your email address using this OTP:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>
      `,
    });

    console.log("OTP email sent successfully to:", user.email);
    return otp;

  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send verification email");
  }
};

export default sendEmailVerificationOTP