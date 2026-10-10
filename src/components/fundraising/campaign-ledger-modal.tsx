"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Calendar,
  Layers,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface CampaignLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
}

interface CampaignData {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  startDate: string;
  endDate: string | null;
  tasksCount: number;
  completedTasksCount: number;
}

interface CampaignSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  targetAmount: number;
  progressPercent: number;
  transactionCount: number;
}

interface CampaignTransaction {
  id: string;
  transactionNumber: string;
  type: "INCOME" | "EXPENSE";
  sourceModule: string;
  amount: number;
  description: string;
  referenceId: string;
  semesterPeriod: string;
  recordedAt: string;
}

export const CampaignLedgerModal: React.FC<CampaignLedgerModalProps> = ({
  isOpen,
  onClose,
  campaignId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [transactions, setTransactions] = useState<CampaignTransaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const loadCampaignLedger = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // If no campaignId provided, first discover the active campaign
      let targetId = campaignId;
      if (!targetId) {
        const listRes = await fetch("/api/fundraising");
        const listData = await listRes.json();
        if (listData?.success && Array.isArray(listData.campaigns) && listData.campaigns.length > 0) {
          targetId = listData.campaigns[0].id;
        } else {
          throw new Error("No active fundraising campaigns found in the organization database.");
        }
      }

      const res = await fetch(`/api/fundraising/${targetId}/ledger`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to load campaign ledger.");
      }

      setCampaign(data.campaign);
      setSummary(data.summary);
      setTransactions(data.transactions || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to fundraising service.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (isOpen) {
      loadCampaignLedger();
    }
  }, [isOpen, loadCampaignLedger]);

  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === "ALL") return true;
    return t.type === activeFilter;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fundraising Campaign Financial Ledger"
      description="Live audit-ready itemized income & expense records linked to the selected student association initiative."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Reconciling campaign ledger records...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">Unable to Load Ledger</span>
            </div>
            <p>{error}</p>
            <Button size="sm" variant="outline" onClick={loadCampaignLedger} className="text-xs gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          </div>
        ) : campaign && summary ? (
          <>
            {/* Campaign Header & Target Progress */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-200 text-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{campaign.title}</h3>
                    <Badge variant={campaign.status === "ACTIVE" ? "primary" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{campaign.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Goal</span>
                  <span className="text-base font-bold text-indigo-400">₹{summary.targetAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400">
                    Gross Raised: ₹{summary.totalIncome.toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-500">
                    {summary.progressPercent}% of target ({summary.transactionCount} transactions)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${summary.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Calculated Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  <span>Gross Inflows</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-emerald-950 mt-1">
                  ₹{summary.totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">Direct donations & proceeds</p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  <span>Campaign Outflows</span>
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-xl font-bold text-rose-950 mt-1">
                  ₹{summary.totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-rose-700 mt-1">Ingredients, supplies & print</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  <span>Net Available Funds</span>
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-950 mt-1">
                  ₹{summary.netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-blue-700 mt-1">Reconciled in treasury ledger</p>
              </div>
            </div>

            {/* Distinguish Section: Itemized Recorded Transactions */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    Verified Transaction Journal ({filteredTransactions.length})
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Each row represents a distinct recorded receipt or expenditure voucher in the database.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px]">
                  <button
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeFilter === "ALL" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({transactions.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("INCOME")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeFilter === "INCOME" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Inflows
                  </button>
                  <button
                    onClick={() => setActiveFilter("EXPENSE")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeFilter === "EXPENSE" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Expenses
                  </button>
                </div>
              </div>

              {/* Transactions List Table */}
              {filteredTransactions.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600">No recorded transactions match this filter.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All official disbursements and donations appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === "INCOME";
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-white transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 line-clamp-1">{tx.description}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-mono text-blue-700 font-bold">{tx.transactionNumber}</span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(tx.recordedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span>&bull;</span>
                              <span className="text-slate-500">{tx.semesterPeriod}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-sm font-extrabold ${
                              isIncome ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isIncome ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Campaign ID: <strong className="font-mono text-slate-700">{campaign.id.slice(0, 18)}...</strong>
              </span>
              <Button size="sm" variant="outline" onClick={onClose} className="text-xs h-7">
                Close Ledger
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};
