"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Upload, FileText, Info } from "lucide-react";

interface FinancialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "request" | "receipt";
  onRequestSubmitted?: () => void;
}

export const FinancialRequestModal: React.FC<FinancialRequestModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "request",
  onRequestSubmitted,
}) => {
  const [mode, setMode] = useState<"request" | "receipt">(defaultMode);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("EVENT_PRODUCTION");
  const [semester, setSemester] = useState("SPRING_2026");
  const [description, setDescription] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please specify a valid item title and positive monetary amount.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/finance/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EXPENSE",
          sourceModule: category,
          amount: parsedAmount,
          currency: "INR",
          description: `${title} - ${description || "Operating expense request"}`,
          referenceId: `REQ-${Date.now().toString(36).toUpperCase()}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to submit financial record.");
      }

      setSubmitted(true);
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Error submitting request";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setAmount("");
    setDescription("");
    setSelectedFileName(null);
    setError(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={mode === "request" ? "New Budget / Expense Request" : "Upload Reimbursement Receipt"}
      description="Submit club operational expenses or volunteer claims for treasury verification."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Toggle Mode */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("request")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === "request"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Budget Request
          </button>
          <button
            type="button"
            onClick={() => setMode("receipt")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === "receipt"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reimbursement Receipt
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Claim Document Recorded</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your submission for <strong>₹{Number(amount).toFixed(2)}</strong> ({title}) has been recorded in the treasury audit ledger.
            </p>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
              [Status: Recorded in Skyline Treasury Audit Queue]
            </div>
            <div>
              <Button size="sm" onClick={handleReset} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Item / Claim Title *
              </label>
              <Input
                placeholder="e.g. Stage lighting cables, Gala dessert catering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white border border-slate-300 text-slate-900 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="EVENT_PRODUCTION">Venue & Event Ops</option>
                  <option value="TECH_SUPPLIES">Tech & Equipment</option>
                  <option value="HOSPITALITY">Volunteer Catering</option>
                  <option value="PRINTING_MEDIA">Printing & Media</option>
                  <option value="OTHER">Other Operational Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Amount (₹ INR) *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Semester / Academic Period
              </label>
              <Input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="SPRING_2026"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Justification / Notes
              </label>
              <textarea
                className="w-full h-16 rounded-xl bg-white border border-slate-300 text-slate-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                placeholder="Explain necessity for club operations or student body..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {mode === "receipt" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  Receipt Document *
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 text-center transition-colors">
                  <input
                    type="file"
                    id="receipt-file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="receipt-file" className="cursor-pointer block">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs text-blue-600 font-medium">
                      {selectedFileName ? selectedFileName : "Choose receipt image or PDF"}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Max file size: 5MB
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Claims are reviewed against the unified treasurer allocation. Verified entries generate double-entry financial audit records in SQLite.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? "Submitting..." : mode === "request" ? "Submit Request" : "Upload Receipt"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
