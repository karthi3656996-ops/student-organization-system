import { NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request payload" },
        { status: 400 }
      );
    }

    const { amount, purpose = "MEMBERSHIP", referenceId = `ref_${Date.now()}`, metadata = {} } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid positive amount in INR is required" },
        { status: 400 }
      );
    }

    const orderResult = await createPaymentOrder({
      amountInRupees: numAmount,
      currency: "INR",
      receipt: `rcpt_${referenceId.slice(0, 30)}`,
      notes: {
        purpose,
        referenceId,
        ...metadata,
      },
    });

    return NextResponse.json({
      success: true,
      order: orderResult,
    });
  } catch (error) {
    console.error("Payment create-order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
