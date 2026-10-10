"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

interface MemberAtRisk {
  memberId: string;
  studentId: string;
  name: string;
  email: string;
  status: string;
  validUntil: string;
  daysRemaining: number;
  urgency: "30_DAYS_BEFORE" | "7_DAYS_BEFORE" | "LAPSED";
}

interface ReminderRecord {
  id: string;
  memberId: string;
  studentId: string;
  memberName: string;
  memberEmail: string;
  reminderType: string;
  status: string;
  sentAt: string;
}

export default function MembershipRemindersPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<{
    totalLoggedReminders: number;
    pendingMembersAtRisk: number;
    lapsedCount: number;
    due7DaysCount: number;
    due30DaysCount: number;
  }>({
    totalLoggedReminders: 0,
    pendingMembersAtRisk: 0,
    lapsedCount: 0,
    due7DaysCount: 0,
    due30DaysCount: 0,
  });
  const [membersAtRisk, setMembersAtRisk] = useState<MemberAtRisk[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/membership/reminders");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setMembersAtRisk(data.membersAtRisk);
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/membership/reminders")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setStats(data.stats);
          setMembersAtRisk(data.membersAtRisk);
          setReminders(data.reminders);
        }
      })
      .catch((err) => console.error("Failed to load reminders:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/membership/reminders/generate", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchReminders();
      }
    } catch (err) {
      console.error("Failed to generate reminders:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F0F7FF] text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 border border-blue-200 px-3 py-1 rounded-full">
            Lifecycle & Renewal Engine
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Membership Expiry & Renewal Reminders
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Automated 30-day, 7-day, and lapsed expiration thresholds with audited records.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Scanning Database..." : "Scan & Log Reminders"}
          </button>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 1. Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Logged Reminders</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalLoggedReminders}</div>
          </div>
          <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm bg-amber-50/20">
            <span className="text-[11px] text-amber-700 font-semibold uppercase">Due in 30 Days</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{stats.due30DaysCount}</div>
          </div>
          <div className="bg-white rounded-2xl border border-orange-200 p-4 shadow-sm bg-orange-50/20">
            <span className="text-[11px] text-orange-700 font-semibold uppercase">Due in 7 Days</span>
            <div className="text-2xl font-bold text-orange-700 mt-1">{stats.due7DaysCount}</div>
          </div>
          <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-sm bg-rose-50/20">
            <span className="text-[11px] text-rose-700 font-semibold uppercase">Lapsed / Expired</span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{stats.lapsedCount}</div>
          </div>
        </div>

        {/* 2. Members Approaching Expiration */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Members Approaching Expiration</h2>
          <p className="text-xs text-slate-500 mb-4">
            Live database scan of active and lapsed member validity dates.
          </p>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs">Evaluating member records...</div>
          ) : membersAtRisk.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No active memberships approaching expiration within the next 30 days.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Valid Until</th>
                    <th className="py-2.5 px-3">Time Left</th>
                    <th className="py-2.5 px-3">Urgency Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {membersAtRisk.map((m) => (
                    <tr key={m.memberId} className="hover:bg-blue-50/20">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{m.name}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold">{m.studentId}</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.email}</td>
                      <td className="py-2.5 px-3 text-slate-600">{new Date(m.validUntil).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{m.daysRemaining} days</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.urgency === "LAPSED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : m.urgency === "7_DAYS_BEFORE"
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {m.urgency.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Dispatched Reminders Audit Trail */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Dispatched Reminders Audit Log</h2>
          <p className="text-xs text-slate-500 mb-4">
            Audited history of dispatched notifications linked to individual member IDs.
          </p>

          {reminders.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No reminder logs recorded yet. Click &quot;Scan &amp; Log Reminders&quot; above to evaluate thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Date Dispatched</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Reminder Threshold</th>
                    <th className="py-2.5 px-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reminders.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/20">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{new Date(r.sentAt).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{r.memberName}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-700">{r.studentId}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{r.reminderType.replace(/_/g, " ")}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status}
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
    </div>
  );
}
