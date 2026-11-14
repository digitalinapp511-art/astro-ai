import { NextResponse } from "next/server";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_U00YoG5jiFz2gA";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "HZlN4CzZP53mvX5f8TzJPrLN";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      userName,
      mandateId,
    } = body;

    if (!razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: "Payment ID missing. Cannot authenticate payment." },
        { status: 400 }
      );
    }

    // 1. Signature Verification if order_id is present
    if (razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.warn("[Razorpay] Signature mismatch for payment:", razorpay_payment_id);
        return NextResponse.json(
          { success: false, message: "Invalid payment signature from Razorpay!" },
          { status: 400 }
        );
      }
      console.log("[Razorpay] Valid HMAC signature for payment:", razorpay_payment_id);
    } else {
      // Direct payment check via Razorpay Payments API
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
      const checkRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      const paymentData = await checkRes.json();
      if (!checkRes.ok || !["authorized", "captured"].includes(paymentData.status)) {
        return NextResponse.json(
          { success: false, message: "Payment is not in authorized/captured state." },
          { status: 400 }
        );
      }
      console.log("[Razorpay] Payment verified via API:", paymentData.status);
    }

    // 2. Sync with Hostinger backend database if reachable
    try {
      await fetch("https://astro.uurja.in/api/v1/subscriptions/verify-mandate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: mandateId || `mandate_${Date.now()}`,
          userId: userId || "guest",
          userName: userName || "Seeker",
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      });
    } catch (e) {
      console.warn("Hostinger sync notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully authenticated!",
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("[Razorpay Verify Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
