"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MemberLookupResult {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department: string;
  status: string;
  validUntil: string | null;
}

interface PaymentRecord {
  id: string;
  academicYear: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  status: string;
  paidAt: string;
  transactionNumber: string | null;
}

export default function MembershipDuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [member, setMember] = useState<MemberLookupResult | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Payment form state
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [amount, setAmount] = useState("499.00");
  const [paymentMethod, setPaymentMethod] = useState("CASH_TABLE");
  const [paymentReference, setPaymentReference] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setPaymentSuccess(null);
    setPaymentError(null);

    try {
      const isEmail = searchQuery.includes("@");
      const param = isEmail ? `email=${encodeURIComponent(searchQuery.trim())}` : `studentId=${encodeURIComponent(searchQuery.trim())}`;
      
      const memberRes = await fetch(`/api/members/lookup?${param}`);
      const memberData = await memberRes.json();

      if (!memberRes.ok || !memberData.success) {
        throw new Error(memberData.error || "Member not found.");
      }

      setMember(memberData.member);

      // Fetch payment history
      const paymentsRes = await fetch(`/api/membership/payments?memberId=${memberData.member.id}`);
      const paymentsData = await paymentsRes.json();
      if (paymentsData.success) {
        setPayments(paymentsData.payments);
      }
    } catch (err) {
      setMember(null);
      setPayments([]);
      setSearchError(err instanceof Error ? err.message : "Failed to find member.");
    } finally {
      setSearching(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSubmittingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      const res = await fetch("/api/membership/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          academicYear: academicYear.trim(),
          amount: parseFloat(amount),
          paymentMethod,
          paymentReference: paymentReference.trim() || `CASH-${Date.now().toString(36).toUpperCase()}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record payment.");
      }

      setPaymentSuccess("Payment successfully verified and written to central ledger!");
      setPaymentReference("");
      
      // Update local member status
      setMember((prev) => prev ? { ...prev, status: "ACTIVE" } : null);

      // Refresh payments list
      const paymentsRes = await fetch(`/api/membership/payments?memberId=${member.id}`);
      const paymentsData = await paymentsRes.json();
      if (paymentsData.success) {
        setPayments(paymentsData.payments);
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment recording failed.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F0F7FF] text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 border border-blue-200 px-3 py-1 rounded-full">
            Treasury & Dues Desk
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Membership Dues & Status Verification
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Verify member standing, record cash table dues, and reconcile receipts against the central treasury ledger.
          </p>
        </div>

        {/* 1. Member Search Bar */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Look Up Student Record</h2>
          <p className="text-xs text-slate-500 mb-4">
            Enter Student ID (e.g. STU-2026-089) or university email to check membership status and payment history.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter Student ID or University Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searching}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-2"
            >
              <Search className="w-4 h-4" />
              {searching ? "Searching..." : "Search Record"}
            </Button>
          </form>

          {searchError && (
            <div className="mt-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* 2. Member Profile & Status (when found) */}
        {member && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  member.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {member.status}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-bold text-blue-700">{member.studentId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{member.department}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="text-blue-700 font-semibold font-mono">
                    {member.validUntil ? new Date(member.validUntil).toLocaleDateString() : "Pending Activation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dues Payment Form */}
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Record Dues Payment
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Submitting creates an atomic double-entry financial ledger record.
              </p>

              {paymentSuccess && (
                <div className="mb-4 flex items-center gap-2 p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{paymentSuccess}</span>
                </div>
              )}

              {paymentError && (
                <div className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Academic Year</label>
                    <Input
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2025-2026"
                      required
                      disabled={submittingPayment}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      disabled={submittingPayment}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none"
                      disabled={submittingPayment}
                    >
                      <option value="CASH_TABLE">Cash at Table</option>
                      <option value="ONLINE">Online Portal / UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Receipt / Ref Code *</label>
                    <Input
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. REC-2026-904"
                      required
                      disabled={submittingPayment}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                  disabled={submittingPayment}
                >
                  {submittingPayment ? "Reconciling Payment..." : "Record Verified Payment"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* 3. Payment History Ledger */}
        {member && (
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Dues Payment History</h3>
            <p className="text-xs text-slate-500 mb-4">
              Audited payment receipts and linked double-entry ledger transaction IDs.
            </p>

            {payments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No payment records found for this member.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Ledger TXN</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/20">
                        <td className="py-2.5 px-3 font-mono">{new Date(p.paidAt).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3">{p.academicYear}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600">₹{p.amount.toFixed(2)}</td>
                        <td className="py-2.5 px-3">{p.paymentMethod}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.paymentReference}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-700">{p.transactionNumber || "N/A"}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
