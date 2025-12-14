import OTP from "../models/OTP.js";
import nodemailer from "nodemailer";
import { generateOtp } from "../utils/generateOtp.js";

export const sendEmailOtp = async (email) => {
  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // hết hạn sau 2 phút

  await OTP.create({ email, otp, expiresAt });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"eBay Clone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    text: `Your verification code is: ${otp}`,
  });
};
