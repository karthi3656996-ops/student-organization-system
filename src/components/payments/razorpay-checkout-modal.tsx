"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, CreditCard, ShieldCheck, Sparkles, Smartphone, Building } from "lucide-react";

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number; // in INR
  purpose: "MEMBERSHIP" | "EVENT_TICKET" | "MERCHANDISE";
  referenceId?: string;
  memberId?: string;
  studentId?: string;
  metadata?: Record<string, string>;
  onSuccess: (result: unknown) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  purpose,
  referenceId,
  memberId,
  studentId,
  metadata = {},
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState<{ paymentId?: string } | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          purpose,
          referenceId,
          metadata: {
            ...metadata,
            method: selectedMethod,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to initialize payment order.");
      }

      const { order } = orderData;

      // Check if real Razorpay checkout is configured and window.Razorpay is available
      const keyId = order.keyId;
      const isLiveRazorpay = !order.isMock && keyId && !keyId.includes("REPLACE_WITH");

      if (isLiveRazorpay && typeof window !== "undefined") {
        // Load Razorpay script if not already loaded
        if (!("Razorpay" in window)) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        // Open Razorpay Standard Checkout
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayObj = (window as any).Razorpay;
        const rzp = new RazorpayObj({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Skyline Student Association",
          description: title,
          order_id: order.orderId,
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError("Payment was cancelled by the user. You may retry payment when ready.");
            },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async (response: any) => {
            await verifyAndComplete(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
          },
          theme: {
            color: "#2563EB",
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rzp.on("payment.failed", (resp: any) => {
          setLoading(false);
          setError(`Payment failed: ${resp.error?.description || "Transaction declined."} You may retry payment.`);
        });

        rzp.open();
        setLoading(false);
        return;
      }

      // If gateway credentials are not configured, clearly indicate setup is incomplete instead of simulating fake payment
      setError("Payment Gateway Setup Incomplete: Razorpay API keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) have not been configured in the server environment (.env). Live payments cannot be processed and transactions cannot be simulated. Please contact the administrator.");
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment execution failed.";
      setError(msg);
      setLoading(false);
    }
  };

  const verifyAndComplete = async (orderId: string, paymentId: string, signature: string) => {
    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          purpose,
          amount,
          memberId,
          studentId,
          bookingReference: referenceId,
          orderId: referenceId,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Payment signature verification failed.");
      }

      setSuccess(true);
      setTxnDetails({ paymentId });
      onSuccess(verifyData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSuccess(false);
    setError(null);
    setTxnDetails(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={success ? "Payment Completed" : "Secure Payment Gateway"}
      description={success ? "Transaction verified and recorded." : "Powered by Razorpay (Test / Sandbox Mode)"}
      maxWidth="md"
    >
      {success ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Payment Successful!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Your payment of <strong>₹{amount.toFixed(2)}</strong> has been verified and recorded into the Skyline financial ledger.
            </p>
          </div>

          <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-mono font-semibold text-blue-700">{txnDetails?.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purpose:</span>
              <span className="font-semibold text-slate-800">{purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <Badge variant="success">PAID & VERIFIED</Badge>
            </div>
          </div>

          <Button size="sm" onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order Summary Pill */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-800 font-medium block">{title}</span>
              <span className="text-xs text-slate-500">Skyline Student Association</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-blue-900">₹{amount.toFixed(2)}</span>
              <span className="text-[10px] text-blue-700 block">INR</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod("upi")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedMethod === "upi"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 font-semibold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedMethod === "card"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 font-semibold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("netbanking")}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedMethod === "netbanking"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 font-semibold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Building className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">NetBanking</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay 256-bit Encrypted Checkout</span>
            </div>
            <Badge variant="primary">TEST MODE</Badge>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              size="md"
              onClick={handlePay}
              isLoading={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5 flex-1"
            >
              <Sparkles className="w-4 h-4" />
              Pay ₹{amount.toFixed(2)} with Razorpay
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
