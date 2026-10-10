"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Plus, Upload, ShieldCheck, Search,
  RefreshCw, DollarSign, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionRow {
  id: string;
  transactionNumber: string;
  type: "INCOME" | "EXPENSE";
  sourceModule: string;
  amount: number;
  referenceId: string | null;
  semesterPeriod: string;
  description: string;
  recordedAt: string;
}

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  availableBalance: number;
  transactionCount: number;
}

interface FinanceViewProps {
  onOpenNewRequest: () => void;
  onOpenUploadReceipt: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  onOpenNewRequest,
  onOpenUploadReceipt,
}) => {
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    totalIncome: 0, totalExpense: 0, availableBalance: 0, transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/ledger?limit=100");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setSummary(data.summary);
      } else {
        setError("Failed to load financial data.");
      }
    } catch {
      setError("Network error loading finance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const filtered = transactions.filter((t) => {
    const typeMatch = filterType === "all" || t.type.toLowerCase() === filterType;
    const q = searchQuery.toLowerCase();
    const searchMatch = !q || t.description.toLowerCase().includes(q) ||
      t.transactionNumber.toLowerCase().includes(q) ||
      t.sourceModule.toLowerCase().includes(q);
    return typeMatch && searchMatch;
  });

  const utilization = summary.totalIncome > 0
    ? Math.round((summary.totalExpense / summary.totalIncome) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ₹{summary.totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">Verified income</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] text-slate-400">Live from financial ledger</div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expense</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ₹{summary.totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-rose-600 font-medium mt-1">{utilization}% of income used</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, utilization)}%` }} />
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ₹{summary.availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              {summary.transactionCount} total transactions
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-600 font-semibold">Verified — live database</span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm">
        {/* Table Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Financial Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} — real data from database
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-0.5 text-xs">
              {(["all", "income", "expense"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                    filterType === f ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-44"
              />
            </div>
            {/* Refresh */}
            <button
              onClick={fetchFinance}
              disabled={loading}
              className="h-8 px-3 text-xs font-semibold text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {/* Action Buttons */}
            <Button variant="outline" size="sm" onClick={onOpenUploadReceipt} className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenNewRequest} className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Request
            </Button>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchFinance} className="text-xs text-blue-600 underline">Try again</button>
          </div>
        ) : loading ? (
          <div className="p-10 flex justify-center">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {searchQuery || filterType !== "all"
                ? "No transactions match your search."
                : "No financial transactions recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 pb-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction #</th>
                  <th className="px-5 pb-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-5 pb-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Module</th>
                  <th className="px-5 pb-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 pb-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-5 pb-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-blue-800 font-semibold">{t.transactionNumber}</td>
                    <td className="px-5 py-3 text-slate-700 max-w-[240px]">
                      <p className="truncate">{t.description}</p>
                      {t.referenceId && (
                        <p className="text-[10px] text-slate-400 font-mono truncate">Ref: {t.referenceId}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {t.sourceModule.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(t.recordedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className={`px-5 py-3 text-right font-bold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.type === "INCOME" ? "+" : "−"}₹{t.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1 text-[10px] font-bold w-fit px-2 py-0.5 rounded-full border ${
                        t.type === "INCOME"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {t.type === "INCOME" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {t.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
