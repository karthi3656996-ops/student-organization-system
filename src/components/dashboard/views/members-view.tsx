"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, UserPlus, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberRosterItem {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  graduationYear: number;
  status: string;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

interface MembersViewProps {
  onOpenRegisterMember: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({ onOpenRegisterMember }) => {
  const [members, setMembers] = useState<MemberRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<MemberRosterItem | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      } else {
        setError("Failed to load members.");
      }
    } catch {
      setError("Network error loading members.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    setLookupError(null);
    try {
      const res = await fetch(`/api/members/lookup?studentId=${encodeURIComponent(lookupId.trim())}`);
      const data = await res.json();
      if (data.success && data.member) {
        setLookupResult(data.member);
      } else {
        setLookupError(data.error ?? "Member not found.");
      }
    } catch {
      setLookupError("Network error during lookup.");
    } finally {
      setLookupLoading(false);
    }
  };

  const filtered = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    return !q ||
      m.name.toLowerCase().includes(q) ||
      m.studentId.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q);
  });

  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const pendingCount = members.filter((m) => m.status === "PENDING_PAYMENT").length;
  const expiredCount = members.filter((m) => m.status === "EXPIRED").length;

  const statusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING_PAYMENT": return "bg-amber-50 text-amber-700 border-amber-200";
      case "EXPIRED": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Members", value: activeCount, icon: CheckCircle2, color: "emerald" },
          { label: "Pending Payment", value: pendingCount, icon: AlertCircle, color: "amber" },
          { label: "Expired", value: expiredCount, icon: AlertCircle, color: "rose" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white rounded-2xl border border-${s.color}-100 p-4 shadow-sm flex items-center justify-between`}>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold text-${s.color}-600 mt-1`}>{loading ? "—" : s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Live from database</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${s.color}-500`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lookup Tool */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Member Lookup</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Student ID to look up..."
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={handleLookup}
            disabled={lookupLoading || !lookupId.trim()}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            {lookupLoading ? "Looking up…" : "Look Up"}
          </Button>
        </div>

        {lookupError && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {lookupError}
          </div>
        )}

        {lookupResult && (
          <div className="mt-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{lookupResult.name}</p>
                <p className="text-xs text-slate-500">{lookupResult.email}</p>
                <p className="text-xs text-slate-500 mt-0.5">{lookupResult.department} • Class of {lookupResult.graduationYear}</p>
                <p className="text-xs font-mono text-blue-700 font-semibold mt-1">{lookupResult.studentId}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusBadge(lookupResult.status)}`}>
                {lookupResult.status}
              </span>
            </div>
            {lookupResult.validUntil && (
              <p className="text-[11px] text-slate-500 mt-2">
                Valid until: <strong>{new Date(lookupResult.validUntil).toLocaleDateString("en-IN", { dateStyle: "long" })}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Member Roster</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} of ${members.length} members shown`} — live from database
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex bg-slate-100 rounded-xl p-0.5 text-xs">
              {["all", "ACTIVE", "PENDING_PAYMENT", "EXPIRED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${statusFilter === f ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {f === "all" ? "All" : f === "PENDING_PAYMENT" ? "Pending" : f === "ACTIVE" ? "Active" : "Expired"}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search members…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-40"
              />
            </div>
            {/* Refresh */}
            <button
              onClick={fetchMembers}
              disabled={loading}
              className="h-8 px-3 text-xs font-semibold text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {/* Register */}
            <Button
              onClick={onOpenRegisterMember}
              size="sm"
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register Member
            </Button>
          </div>
        </div>

        {/* Table Body */}
        {error ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button onClick={fetchMembers} className="text-xs text-blue-600 underline">Retry</button>
          </div>
        ) : loading ? (
          <div className="p-10 flex justify-center">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {searchQuery ? "No members match your search." : "No members registered yet."}
            </p>
            <button
              onClick={onOpenRegisterMember}
              className="mt-3 text-xs text-blue-600 font-semibold underline"
            >
              Register the first member →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Member", "Student ID", "Department", "Grad Year", "Status", "Valid Until", "Joined"].map((h) => (
                    <th key={h} className="px-5 pb-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{m.name}</p>
                          <p className="text-[10px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-blue-700 font-semibold">{m.studentId}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-[160px] truncate">{m.department}</td>
                    <td className="px-5 py-3 text-slate-500">{m.graduationYear}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {m.validUntil ? new Date(m.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
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
