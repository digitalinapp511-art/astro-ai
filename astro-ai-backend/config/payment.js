// Payment Gateway & UPI Auto-Pay Mandate Configuration (Strict Environment Separation)
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

export const paymentConfig = {
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  defaultTrialFee: 4, // ₹4 Initial Mandate Setup Fee
  defaultTrialDays: 3, // 3-Day Free Trial
  defaultMonthlyDebit: 299, // ₹299 Monthly Auto-Debit
};

export const getRazorpayInstance = () => {
  if (!paymentConfig.razorpayKeyId || !paymentConfig.razorpayKeySecret) {
    console.warn("⚠️ Razorpay keys missing in environment variables. Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET on Render.");
    return null;
  }
  return new Razorpay({
    key_id: paymentConfig.razorpayKeyId,
    key_secret: paymentConfig.razorpayKeySecret,
  });
};
