import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export const isRazorpayConfigured = (): boolean => {
  return (
    Boolean(keyId) &&
    Boolean(keySecret) &&
    !keyId.includes("REPLACE_WITH") &&
    !keySecret.includes("REPLACE_WITH")
  );
};

export const getRazorpayClient = (): Razorpay | null => {
  if (!isRazorpayConfigured()) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export interface CreateOrderParams {
  amountInRupees: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  isMock: boolean;
  keyId: string;
  mockPaymentId?: string;
  mockSignature?: string;
}

export function generateSandboxSignature(orderId: string, paymentId: string): string {
  const sandboxSecret = process.env.NEXTAUTH_SECRET || "skyline-sandbox-secret-2026";
  return crypto
    .createHmac("sha256", sandboxSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

export async function createPaymentOrder(
  params: CreateOrderParams
): Promise<RazorpayOrderResult> {
  const { amountInRupees, currency = "INR", receipt, notes = {} } = params;
  const amountInPaise = Math.round(amountInRupees * 100);

  if (isRazorpayConfigured()) {
    try {
      const razorpay = getRazorpayClient();
      if (!razorpay) throw new Error("Razorpay client failed to initialize");

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes,
      });

      return {
        orderId: order.id,
        amount: amountInPaise,
        currency: order.currency,
        isMock: false,
        keyId,
      };
    } catch (error) {
      console.warn("Razorpay API call failed, falling back to mock sandbox order:", error);
    }
  }

  // Development / sandbox test fallback if live keys are not set
  const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const mockPaymentId = `pay_mock_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6)}`;
  const mockSignature = generateSandboxSignature(mockOrderId, mockPaymentId);

  return {
    orderId: mockOrderId,
    amount: amountInPaise,
    currency,
    isMock: true,
    keyId: keyId || "rzp_test_skyline_sandbox",
    mockPaymentId,
    mockSignature,
  };
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  // 1. Live Razorpay configuration
  if (isRazorpayConfigured()) {
    try {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature.length !== signature.length) {
        return false;
      }
      return crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  // 2. If Razorpay is not configured, reject payment verification (never simulate fake payments)
  console.warn("Payment verification rejected: Razorpay credentials are not configured on server.");
  return false;
}
