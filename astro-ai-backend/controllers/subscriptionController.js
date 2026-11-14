// UPI Auto-Pay Mandate & 3-Day Trial Controller with Official Razorpay Integration
import crypto from "crypto";
import { MandateModel } from "../models/Mandate.js";
import { UserModel } from "../models/User.js";
import { paymentConfig, getRazorpayInstance } from "../config/payment.js";

// 1. GET Mandate Config & Public Razorpay Key
export const getMandateConfig = (req, res) => {
  res.json({
    success: true,
    config: MandateModel.getConfig(),
    razorpayKeyId: paymentConfig.razorpayKeyId,
  });
};

// 2. PUT Update Mandate Config
export const updateMandateConfig = (req, res) => {
  const updated = MandateModel.updateConfig(req.body);
  res.json({
    success: true,
    message: "Mandate configuration updated successfully!",
    config: updated,
  });
};

// 3. POST Create Mandate / Razorpay Order
export const createMandateOrder = async (req, res) => {
  try {
    const { upiApp, userId, userName, amount } = req.body;
    const config = MandateModel.getConfig();
    const finalAmountRupees = Number(amount) || config.trialSetupFee || 4;
    const amountInPaise = Math.round(finalAmountRupees * 100);

    const rzp = getRazorpayInstance();
    let razorpayOrder = null;

    if (rzp) {
      try {
        razorpayOrder = await rzp.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_mandate_${Date.now()}`,
          notes: {
            userId: userId || "guest",
            userName: userName || "Seeker",
            plan: "VIP 3-Day Trial Pass",
            setupFee: `${finalAmountRupees}`,
          },
        });
      } catch (err) {
        console.error("❌ [Razorpay] Order creation failed:", err);
      }
    }

    const orderId = razorpayOrder ? razorpayOrder.id : `order_mock_${Date.now()}`;
    const mandate = {
      mandateId: `mandate_${Date.now()}`,
      orderId,
      setupFee: finalAmountRupees,
      trialDays: config.trialDays,
      recurringAmount: config.recurringAutoDebitAmount,
      currency: "INR",
      upiApp: upiApp || "razorpay",
      status: "pending_authorization",
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: `Razorpay order for ₹${finalAmountRupees} created!`,
      keyId: paymentConfig.razorpayKeyId,
      razorpayOrderId: orderId,
      order: razorpayOrder,
      mandate,
    });
  } catch (error) {
    console.error("Error creating mandate order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating payment order",
      error: error.message,
    });
  }
};

// 4. POST Verify & Activate Mandate / Razorpay Payment
export const verifyMandate = async (req, res) => {
  try {
    const { 
      mandateId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      upiApp, 
      userId, 
      userName 
    } = req.body;

    // Strict authentication: Require authentic Razorpay order ID, payment ID and signature
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("⚠️ [Razorpay] Attempted activation without authentic Razorpay payment credentials!");
      return res.status(400).json({
        success: false,
        message: "Real payment verification required! Payment ID and signature are missing.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", paymentConfig.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn("⚠️ [Razorpay] Invalid payment signature verification failed!");
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature!",
      });
    }
    console.log(`✅ [Razorpay] Real Payment Signature Authenticated! Payment ID: ${razorpay_payment_id}`);

    // Save mandate & subscription
    const subscription = MandateModel.createSubscription({
      mandateId: mandateId || `mandate_${Date.now()}`,
      userId: userId || "u-1",
      userName: userName || "Seeker",
      upiApp: upiApp || "razorpay",
      razorpayPaymentId: razorpay_payment_id || null,
      razorpayOrderId: razorpay_order_id || null,
    });

    // Mark user as VIP in database
    if (userId) {
      await UserModel.markVIP(userId);
    }

    res.json({
      success: true,
      message: "🎉 Mubarak! Aapka 3-Day VIP Free Trial Active Ho Gaya!",
      subscription,
      paymentId: razorpay_payment_id || null,
    });
  } catch (error) {
    console.error("Error verifying mandate payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify mandate payment",
      error: error.message,
    });
  }
};

// 5. POST Cancel Auto-Debit
export const cancelMandate = (req, res) => {
  const { mandateId } = req.body;
  MandateModel.cancelSubscription(mandateId);

  res.json({
    success: true,
    message: "Aapka UPI Auto-Debit Mandate cancel kar diya gaya hai. Agla koi deduction nahi hoga.",
  });
};
