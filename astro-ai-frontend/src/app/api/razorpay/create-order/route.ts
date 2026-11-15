import { NextResponse } from "next/server";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_U00YoG5jiFz2gA";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: Request) {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      console.error("[Razorpay Error] RAZORPAY_KEY_SECRET is not configured in environment variables.");
      return NextResponse.json(
        {
          success: false,
          message: "Payment gateway credentials are not configured on the server.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount || 4); // in INR
    const amountInPaise = Math.round(amount * 100);
    const userId = body.userId || "guest";
    const upiApp = body.upiApp || "phonepe";

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `vip_${Date.now()}`,
        notes: {
          userId,
          upiApp,
          service: "VIP_PASS_TRIAL",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.id) {
      console.error("[Razorpay API Error]", data);
      return NextResponse.json(
        {
          success: false,
          message: data.error?.description || "Order creation failed on Razorpay",
          keyId: RAZORPAY_KEY_ID,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("[Razorpay Order Exception]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error during order creation",
        keyId: RAZORPAY_KEY_ID,
      },
      { status: 500 }
    );
  }
}
