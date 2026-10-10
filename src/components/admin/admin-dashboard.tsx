"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Calendar, DollarSign, ShoppingBag, TrendingUp, TrendingDown,
  LayoutDashboard, ShieldCheck, Bell, Settings, LogOut, ClipboardList,
  Package, HeartHandshake, BarChart3, Menu, X, AlertCircle, Plus,
  CheckCircle2, Download
} from "lucide-react";
import { CreateEventModal } from "@/components/dashboard/modals/create-event-modal";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CampaignLedgerModal } from "@/components/fundraising/campaign-ledger-modal";
import { generateSemesterPdfReport } from "@/lib/pdf-report";

interface AdminStats {
  totalMembers: number; activeMembers: number; pendingMembers: number;
  totalEvents: number; publishedEvents: number; pendingClaims: number;
  totalOrders: number; totalIncome: number; totalExpense: number; balance: number;
}

interface Transaction {
  id: string; transactionNumber: string; type: "INCOME" | "EXPENSE";
  sourceModule: string; amount: number; description: string; recordedAt: string;
}

interface RecentMember {
  id: string; studentId: string; name: string; email: string;
  department: string; status: string; createdAt: string;
}

interface AdminDashboardProps {
  adminName: string; adminRole: string;
  stats: AdminStats;
  recentTransactions: Transaction[];
  recentMembers: RecentMember[];
}

const navItems = [
  { label: "Overview", icon: LayoutDashboard, key: "overview" },
  { label: "Members", icon: Users, key: "members" },
  { label: "Events", icon: Calendar, key: "events" },
  { label: "Finance", icon: DollarSign, key: "finance" },
  { label: "Claims", icon: ClipboardList, key: "claims" },
  { label: "Merchandise", icon: ShoppingBag, key: "merch" },
  { label: "Announcements", icon: Bell, key: "announcements" },
  { label: "Fundraising", icon: HeartHandshake, key: "fundraising" },
  { label: "Reports", icon: BarChart3, key: "reports" },
  { label: "Settings", icon: Settings, key: "settings" },
];

export default function AdminDashboard({
  adminName, adminRole, stats, recentTransactions, recentMembers,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-16"} bg-white border-r border-blue-100 flex flex-col transition-all duration-200 shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-blue-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Admin Portal</p>
              <p className="text-[10px] text-blue-600 font-semibold truncate">Skyline SSA</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-blue-100 space-y-1">
          {sidebarOpen && (
            <div className="px-2.5 py-2 rounded-xl bg-blue-50 mb-1">
              <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
              <p className="text-[10px] text-blue-600 font-semibold">{adminRole}</p>
            </div>
          )}
          <Link
            href="/"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
            {sidebarOpen && <span>Public Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {navItems.find((n) => n.key === activeTab)?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-slate-500">Skyline Student Association — Operations Management</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              {adminRole}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "overview" && (
            <OverviewTab
              stats={stats}
              recentTransactions={recentTransactions}
              recentMembers={recentMembers}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === "members" && <MembersTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "finance" && <FinanceTab stats={stats} recentTransactions={recentTransactions} />}
          {activeTab === "claims" && <ClaimsTab />}
          {activeTab === "merch" && <MerchTab />}
          {activeTab === "announcements" && <AnnouncementsTab />}
          {activeTab === "fundraising" && <FundraisingTab />}
          {activeTab === "reports" && <ReportsTab stats={stats} />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════
function OverviewTab({
  stats, recentTransactions, recentMembers, onNavigate,
}: {
  stats: AdminStats;
  recentTransactions: Transaction[];
  recentMembers: RecentMember[];
  onNavigate: (tab: string) => void;
}) {
  const kpis = [
    { label: "Active Members", value: stats.activeMembers.toString(), sub: `${stats.pendingMembers} pending payment`, icon: Users, color: "blue", tab: "members" },
    { label: "Published Events", value: stats.publishedEvents.toString(), sub: `${stats.totalEvents} total created`, icon: Calendar, color: "indigo", tab: "events" },
    { label: "Pending Claims", value: stats.pendingClaims.toString(), sub: "Awaiting treasurer audit", icon: AlertCircle, color: "amber", tab: "claims" },
    { label: "Ledger Balance", value: `₹${stats.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, sub: `In: ₹${stats.totalIncome.toFixed(2)} | Out: ₹${stats.totalExpense.toFixed(2)}`, icon: DollarSign, color: "emerald", tab: "finance" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              onClick={() => onNavigate(kpi.tab)}
              className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[kpi.color]}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Transactions + Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            <button
              onClick={() => onNavigate("finance")}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View Ledger →
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No transactions recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {t.type === "INCOME" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 font-mono truncate">{t.transactionNumber}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ml-2 ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.type === "INCOME" ? "+" : "-"}₹{t.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
            <button
              onClick={() => onNavigate("members")}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View Roster →
            </button>
          </div>
          {recentMembers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No members registered yet.</p>
          ) : (
            <div className="space-y-2">
              {recentMembers.slice(0, 6).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.studentId} • {m.department.split(" ")[0]}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    m.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : m.status === "PENDING_PAYMENT" ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>{m.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm">
        <h3 className="text-sm font-bold mb-3">Quick Navigation</h3>
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: "Manage Members", icon: Users, tab: "members" },
            { label: "Create / View Events", icon: Calendar, tab: "events" },
            { label: "Review Claims", icon: ClipboardList, tab: "claims" },
            { label: "Merch Inventory & Orders", icon: Package, tab: "merch" },
            { label: "Announcements Circulars", icon: Bell, tab: "announcements" },
            { label: "Fundraising Kanban", icon: HeartHandshake, tab: "fundraising" },
            { label: "Export Financial Reports", icon: BarChart3, tab: "reports" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => onNavigate(a.tab)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold border border-white/20 transition-all cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MEMBERS TAB
// ══════════════════════════════════════════════════════════════
function MembersTab() {
  const [members, setMembers] = useState<RecentMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members?limit=200");
      const data = await res.json();
      if (data.success) setMembers(data.members);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) ||
      m.studentId.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Member Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">All registered students from live database ({members.length} total)</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <button
              onClick={load}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && !loaded ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            {loaded ? "No members match your criteria." : "Loading..."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 pl-2">Name & Email</th>
                  <th className="pb-3">Student ID</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 pl-2">
                      <p className="font-semibold text-slate-800">{m.name}</p>
                      <p className="text-[10px] text-slate-400">{m.email}</p>
                    </td>
                    <td className="py-2.5 font-mono text-blue-700 font-semibold">{m.studentId}</td>
                    <td className="py-2.5 text-slate-600 max-w-[160px] truncate">{m.department}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : m.status === "PENDING_PAYMENT" ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>{m.status}</span>
                    </td>
                    <td className="py-2.5 text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EVENTS TAB
// ══════════════════════════════════════════════════════════════
function EventsTab() {
  const [events, setEvents] = useState<{
    id: string; title: string; status: string; venue: string; startTime: string;
    totalCapacity: number; bookedTickets: number; pendingTickets?: number; remainingCapacity: number;
    imageUrl?: string;
    ticketTiers: { id: string; tierName: string; price: number; isMemberOnly: boolean }[];
    bookings?: {
      id: string; bookingReference: string; guestName?: string | null; guestEmail?: string | null;
      paymentStatus: string; totalAmount: number; ticketCount: number; createdAt: string;
    }[];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const loadEvents = () => {
    setLoading(true);
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => { if (d.success) setEvents(d.events); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Events & Ticket Capacity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage seat caps, multi-tier pricing, and attendee payment verification</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Event
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center py-10 text-sm text-slate-400">No events published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const pct = Math.round((ev.bookedTickets / Math.max(1, ev.totalCapacity)) * 100);
              const isExpanded = expandedEventId === ev.id;
              return (
                <div key={ev.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors bg-white">
                  <div className="w-full h-32 rounded-lg bg-slate-900 border border-slate-100 overflow-hidden mb-3 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ev.imageUrl || "/images/events/default-event.svg"}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/events/default-event.svg";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/90 text-white shadow-sm backdrop-blur-md">
                        {ev.remainingCapacity} seats left
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ev.venue} • {new Date(ev.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Ticket Tiers */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ev.ticketTiers?.map((t) => (
                      <span key={t.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600">
                        {t.tierName}: <strong>₹{t.price}</strong> {t.isMemberOnly && "(Member)"}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Confirmed: <strong>{ev.bookedTickets}</strong> {ev.pendingTickets ? `(${ev.pendingTickets} pending)` : ""}</span>
                      <span>Capacity: {ev.totalCapacity} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Bookings toggle */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {ev.bookings?.length || 0} reservation(s) recorded
                    </span>
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                      className="text-blue-600 font-semibold hover:underline text-[11px] cursor-pointer"
                    >
                      {isExpanded ? "Hide Bookings ▲" : "View Bookings ▼"}
                    </button>
                  </div>

                  {isExpanded && ev.bookings && ev.bookings.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 max-h-48 overflow-y-auto">
                      {ev.bookings.map((b) => (
                        <div key={b.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-mono font-bold text-blue-700 mr-2">{b.bookingReference}</span>
                            <span className="text-slate-700">{b.guestName || "Guest"}</span>
                            <span className="text-slate-400 ml-1">({b.ticketCount}x)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">₹{b.totalAmount.toFixed(2)}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              b.paymentStatus === "PAID" || b.paymentStatus === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : b.paymentStatus === "PENDING_PAYMENT"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={() => {
          loadEvents();
          setCreateModalOpen(false);
        }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FINANCE TAB
// ══════════════════════════════════════════════════════════════
function FinanceTab({ stats, recentTransactions }: { stats: AdminStats; recentTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState(recentTransactions);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/ledger?limit=150");
      const data = await res.json();
      if (data.success) setTransactions(data.transactions);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((t) =>
    filter === "all" || t.type === filter.toUpperCase()
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Inflow (Income)", value: `₹${stats.totalIncome.toFixed(2)}`, color: "emerald", desc: "Dues, tickets, merchandise, bake sales" },
          { label: "Total Outflow (Expense)", value: `₹${stats.totalExpense.toFixed(2)}`, color: "rose", desc: "Approved reimbursements & direct claims" },
          { label: "Net Operating Balance", value: `₹${stats.balance.toFixed(2)}`, color: "blue", desc: "Reconciled treasury fund" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-bold mt-2 ${c.color === "emerald" ? "text-emerald-600" : c.color === "rose" ? "text-rose-600" : "text-blue-600"}`}>
              {c.value}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Unified Treasury Ledger</h3>
            <p className="text-xs text-slate-500">Double-entry audit trail across all association modules</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
              {["all", "income", "expense"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${filter === f ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={loadAll}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {loading ? "Loading..." : "Load Full Ledger"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-2">TXN Number</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Module</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pl-2 font-mono text-blue-800 font-semibold text-[10px]">{t.transactionNumber}</td>
                  <td className="py-2.5 text-slate-700 max-w-[240px] truncate">{t.description}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">{t.sourceModule}</span>
                  </td>
                  <td className="py-2.5 text-slate-400">{new Date(t.recordedAt).toLocaleDateString()}</td>
                  <td className={`py-2.5 text-right pr-2 font-bold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.type === "INCOME" ? "+" : "-"}₹{t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-slate-400">No transactions recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CLAIMS TAB (Reimbursement Approvals Workflow)
// ══════════════════════════════════════════════════════════════
function ClaimsTab() {
  const [claims, setClaims] = useState<{
    id: string; claimNumber: string; category: string; amount: number;
    description: string; receiptUrl: string; status: string;
    volunteer: { name: string; email: string };
    reviewedBy?: { name: string } | null;
    reviewNotes?: string | null;
    submittedAt: string;
    financialTxn?: { transactionNumber: string } | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionClaim, setActionClaim] = useState<typeof claims[0] | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadClaims = () => {
    setLoading(true);
    fetch("/api/finance/claims")
      .then((r) => r.json())
      .then((d) => { if (d.success) setClaims(d.claims); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClaims(); }, []);

  const handleReviewAction = async (action: "APPROVE" | "REJECT") => {
    if (!actionClaim) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/finance/claims/${actionClaim.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setActionClaim(null);
        setReviewNotes("");
        loadClaims();
      } else {
        alert(data.error || "Review submission failed");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Volunteer Expense Reimbursements</h2>
            <p className="text-xs text-slate-500 mt-0.5">Treasurer 2-step audit workflow with digital receipt validation</p>
          </div>
          <button
            onClick={loadClaims}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
          >
            Refresh Claims
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : claims.length === 0 ? (
          <p className="text-center py-10 text-sm text-slate-400">No reimbursement claims submitted.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 pl-2">Claim ID</th>
                  <th className="pb-3">Volunteer</th>
                  <th className="pb-3">Category & Details</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pl-2 font-mono text-blue-800 font-bold">{c.claimNumber}</td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{c.volunteer?.name}</p>
                      <p className="text-[10px] text-slate-400">{c.volunteer?.email}</p>
                    </td>
                    <td className="py-3 max-w-[220px]">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {c.category}
                      </span>
                      <p className="text-xs text-slate-600 mt-1 truncate">{c.description}</p>
                    </td>
                    <td className="py-3 font-bold text-slate-900">₹{c.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : c.status === "REJECTED" ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {c.status}
                      </span>
                      {c.financialTxn && (
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                          {c.financialTxn.transactionNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      {c.status === "SUBMITTED" ? (
                        <button
                          onClick={() => {
                            setActionClaim(c);
                            setReviewNotes("");
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Review & Audit
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {actionClaim && (
        <Modal
          isOpen={Boolean(actionClaim)}
          onClose={() => setActionClaim(null)}
          title={`Review Claim: ${actionClaim.claimNumber}`}
          description={`Submitted by ${actionClaim.volunteer?.name} for ₹${actionClaim.amount.toFixed(2)}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
              <p><strong>Category:</strong> {actionClaim.category}</p>
              <p className="mt-1"><strong>Description:</strong> {actionClaim.description}</p>
              <p className="mt-1"><strong>Receipt:</strong> <span className="font-mono text-blue-700">{actionClaim.receiptUrl}</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Notes / Comments</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Receipt verified with event budget item. Approved for reimbursement."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionClaim(null)}
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                onClick={() => handleReviewAction("REJECT")}
                disabled={submittingReview}
              >
                Reject Claim
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                onClick={() => handleReviewAction("APPROVE")}
                disabled={submittingReview}
              >
                Approve & Disburse
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MERCH TAB
// ══════════════════════════════════════════════════════════════
function MerchTab() {
  const [items, setItems] = useState<{
    id: string; name: string; description: string; imageUrl?: string; basePrice: number; memberPrice: number;
    variants: { id: string; size: string; color: string; stockQuantity: number }[];
  }[]>([]);
  const [orders, setOrders] = useState<{
    id: string; orderNumber: string; buyerName: string; totalAmount: number;
    paymentStatus: string; fulfillmentStatus: string; pickupCode: string; createdAt: string;
    items: { itemName: string; size: string; quantity: number }[];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add Item form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("/images/merch/hoodie.svg");
  const [newBasePrice, setNewBasePrice] = useState("499");
  const [newMemberPrice, setNewMemberPrice] = useState("349");
  const [newStockXS, setNewStockXS] = useState("10");
  const [newStockS, setNewStockS] = useState("20");
  const [newStockM, setNewStockM] = useState("30");
  const [newStockL, setNewStockL] = useState("25");
  const [newStockXL, setNewStockXL] = useState("15");
  const [submittingItem, setSubmittingItem] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/merch").then((r) => r.json()),
      fetch("/api/merch/orders").then((r) => r.json()),
    ]).then(([itemsData, ordersData]) => {
      if (itemsData.success) setItems(itemsData.items);
      if (ordersData.success) setOrders(ordersData.orders);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingItem(true);
    try {
      const res = await fetch("/api/merch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          imageUrl: newImageUrl.trim() || "/images/merch/default-merch.svg",
          basePrice: parseFloat(newBasePrice),
          memberPrice: parseFloat(newMemberPrice),
          variants: [
            { size: "XS", color: "Standard", stockQuantity: parseInt(newStockXS) || 0 },
            { size: "S", color: "Standard", stockQuantity: parseInt(newStockS) || 0 },
            { size: "M", color: "Standard", stockQuantity: parseInt(newStockM) || 0 },
            { size: "L", color: "Standard", stockQuantity: parseInt(newStockL) || 0 },
            { size: "XL", color: "Standard", stockQuantity: parseInt(newStockXL) || 0 },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        setNewName("");
        setNewDesc("");
        setNewImageUrl("/images/merch/hoodie.svg");
        loadData();
      } else {
        alert(data.error || "Failed to create merchandise item.");
      }
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleUpdateFulfillment = async (orderId: string, fulfillmentStatus: string) => {
    try {
      const res = await fetch("/api/merch/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, fulfillmentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      console.error("Update fulfillment error:", e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Merchandise Catalog */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Merchandise Catalog</h3>
              <p className="text-xs text-slate-500">Live per-size variant inventory engine</p>
            </div>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No products created.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const totalStock = item.variants.reduce((s, v) => s + v.stockQuantity, 0);
                return (
                  <div key={item.id} className="p-3.5 rounded-xl border border-slate-100 bg-white flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || "/images/merch/default-merch.svg"}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/merch/default-merch.svg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${totalStock > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                          {totalStock} in stock
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-700">
                          Base: ₹{item.basePrice} | <span className="text-emerald-600">Member: ₹{item.memberPrice}</span>
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.variants.map((v) => (
                          <span key={v.id} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600">
                            {v.size}: <strong>{v.stockQuantity}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Orders */}
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Merchandise Orders</h3>
              <p className="text-xs text-slate-500">Pick-up fulfillment & verification</p>
            </div>
            <button
              onClick={loadData}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-3.5 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-blue-800">{o.orderNumber}</p>
                      <p className="text-xs text-slate-700 font-semibold">{o.buyerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">₹{o.totalAmount.toFixed(2)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.fulfillmentStatus === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : o.fulfillmentStatus === "READY_FOR_PICKUP" ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {o.fulfillmentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Pickup Code: <strong className="font-mono text-slate-800">{o.pickupCode}</strong></span>
                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Fulfillment Action Buttons */}
                  <div className="mt-2.5 pt-2 border-t border-slate-50 flex justify-end gap-1.5">
                    {o.fulfillmentStatus === "PENDING" && (
                      <button
                        onClick={() => handleUpdateFulfillment(o.id, "READY_FOR_PICKUP")}
                        className="px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Ready For Pickup
                      </button>
                    )}
                    {o.fulfillmentStatus !== "COMPLETED" && (
                      <button
                        onClick={() => handleUpdateFulfillment(o.id, "COMPLETED")}
                        className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Merch Modal */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add New Merchandise Product"
          description="Create branded hoodies or tees with independent per-size inventory tracking."
        >
          <form onSubmit={handleCreateMerch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
              <Input
                placeholder="e.g. Skyline Signature Fleece Hoodie"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
              <textarea
                placeholder="Fabric details, print style, warranty..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Visual / Image *</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { label: "Club Hoodie", url: "/images/merch/hoodie.svg" },
                  { label: "Crest T-Shirt", url: "/images/merch/tshirt.svg" },
                  { label: "Water Flask", url: "/images/merch/bottle.svg" },
                ].map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setNewImageUrl(p.url)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border cursor-pointer ${
                      newImageUrl === p.url
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Image URL (e.g. /images/merch/hoodie.svg)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="text-xs"
                />
                {newImageUrl && (
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={newImageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/merch/default-merch.svg";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price (₹) *</label>
                <Input
                  type="number"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Member Price (₹) *</label>
                <Input
                  type="number"
                  value={newMemberPrice}
                  onChange={(e) => setNewMemberPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Size Variants Stock Count</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: "XS", val: newStockXS, set: setNewStockXS },
                  { label: "S", val: newStockS, set: setNewStockS },
                  { label: "M", val: newStockM, set: setNewStockM },
                  { label: "L", val: newStockL, set: setNewStockL },
                  { label: "XL", val: newStockXL, set: setNewStockXL },
                ].map((s) => (
                  <div key={s.label}>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">{s.label}</span>
                    <Input
                      type="number"
                      value={s.val}
                      onChange={(e) => s.set(e.target.value)}
                      className="h-8 text-xs text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs" disabled={submittingItem}>
                {submittingItem ? "Creating..." : "Save Product"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ANNOUNCEMENTS TAB
// ══════════════════════════════════════════════════════════════
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<{
    id: string; title: string; content: string; priority: string;
    audience: string; publishedAt: string; author: { name: string };
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [audience, setAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = () => {
    setLoading(true);
    fetch("/api/announcements?limit=50")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAnnouncements(d.announcements); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAnnouncements(); }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, priority, audience }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setTitle("");
        setContent("");
        loadAnnouncements();
      } else {
        alert(data.error || "Failed to post announcement");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campus Bulletin & Notices</h2>
            <p className="text-xs text-slate-500 mt-0.5">Publish circulars directly to student portal and public board</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Circular
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No announcements posted yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border ${a.priority === "URGENT" ? "border-red-200 bg-red-50/40" : "border-blue-100 bg-blue-50/20"}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{a.title}</p>
                    {a.priority === "URGENT" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                        URGENT
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {a.audience}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-line">{a.content}</p>
                <p className="text-[10px] text-slate-400 mt-2">Author: {a.author?.name || "Official"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Post Association Circular"
          description="Verified official circular for students and member bulletin archive."
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
              <Input
                placeholder="e.g. Spring Gala 2026 Ticket Sales Live"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content *</label>
              <textarea
                rows={4}
                placeholder="Full circular details, date, instructions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 px-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full h-9 px-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="ALL">All Students</option>
                  <option value="MEMBERS_ONLY">Members Only</option>
                  <option value="VOLUNTEERS">Volunteers</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs" disabled={submitting}>
                {submitting ? "Publishing..." : "Publish Circular"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FUNDRAISING & KANBAN TAB
// ══════════════════════════════════════════════════════════════
function FundraisingTab() {
  const [campaigns, setCampaigns] = useState<{
    id: string; title: string; description: string; targetAmount: number;
    currentAmount: number; progressPercent: number; status: string;
  }[]>([]);
  const [tasks, setTasks] = useState<{
    id: string; title: string; description: string; status: "TO_DO" | "IN_PROGRESS" | "DONE";
    priority: string; campaignTitle?: string | null; assignedTo?: { name: string } | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);

  // New task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("HIGH");
  const [submittingTask, setSubmittingTask] = useState(false);

  const loadFundraising = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/fundraising").then((r) => r.json()),
      fetch("/api/fundraising/tasks").then((r) => r.json()),
    ]).then(([campData, taskData]) => {
      if (campData.success) setCampaigns(campData.campaigns);
      if (taskData.success) setTasks(taskData.tasks);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadFundraising(); }, []);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: "TO_DO" | "IN_PROGRESS" | "DONE") => {
    try {
      const res = await fetch("/api/fundraising/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (e) {
      console.error("Update task status error:", e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTask(true);
    try {
      const activeCampaign = campaigns[0];
      const res = await fetch("/api/fundraising/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          campaignId: activeCampaign?.id,
          status: "TO_DO",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTaskModalOpen(false);
        setTaskTitle("");
        setTaskDesc("");
        loadFundraising();
      }
    } finally {
      setSubmittingTask(false);
    }
  };

  const activeCampaign = campaigns[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Campaign Progress Card */}
      {activeCampaign && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Active Fundraiser Campaign
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{activeCampaign.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeCampaign.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500">Total Funds Raised</p>
              <p className="text-2xl font-bold text-emerald-600">
                ₹{activeCampaign.currentAmount.toLocaleString()} / ₹{activeCampaign.targetAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${activeCampaign.progressPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-500 mt-2 gap-2">
            <span>Progress: {activeCampaign.progressPercent}% of target (₹{activeCampaign.currentAmount.toLocaleString()} raised)</span>
            <div className="flex items-center gap-3">
              <span>Target: ₹{activeCampaign.targetAmount.toLocaleString()}</span>
              <button
                onClick={() => setLedgerModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                View Full Campaign Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Ledger Modal */}
      {ledgerModalOpen && (
        <CampaignLedgerModal
          isOpen={ledgerModalOpen}
          onClose={() => setLedgerModalOpen(false)}
          campaignId={activeCampaign?.id}
        />
      )}

      {/* Volunteer Kanban Board */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Volunteer Operations Kanban Board</h3>
            <p className="text-xs text-slate-500">Assign baking, supply procurement, and booth management tasks</p>
          </div>
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Assign Task
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column: TO_DO */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-700">To Do</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {tasks.filter((t) => t.status === "TO_DO").length}
                </span>
              </div>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.status === "TO_DO").map((t) => (
                  <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">{t.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.priority === "HIGH" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{t.assignedTo?.name || "Unassigned"}</span>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, "IN_PROGRESS")}
                        className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: IN_PROGRESS */}
            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-blue-800">In Progress</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-200 text-blue-800">
                  {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                </span>
              </div>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.status === "IN_PROGRESS").map((t) => (
                  <div key={t.id} className="p-3 bg-white rounded-xl border border-blue-200 shadow-sm hover:border-blue-400 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">{t.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.priority === "HIGH" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, "TO_DO")}
                        className="text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, "DONE")}
                        className="text-emerald-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: DONE */}
            <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-100">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-emerald-800">Completed</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                  {tasks.filter((t) => t.status === "DONE").length}
                </span>
              </div>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.status === "DONE").map((t) => (
                  <div key={t.id} className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 line-through">{t.title}</p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{t.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{t.assignedTo?.name}</span>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, "IN_PROGRESS")}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Reopen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {taskModalOpen && (
        <Modal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          title="Create Volunteer Task"
          description="Assign campaign tasks (baking, supply run, quad table shifts)."
        >
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
              <Input
                placeholder="e.g. Staff Quad booth 12pm-3pm"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Description</label>
              <textarea
                placeholder="Bring tablecloth, flyers, and receipt book..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full h-9 px-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs" disabled={submittingTask}>
                {submittingTask ? "Saving..." : "Add to Kanban"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// REPORTS TAB
// ══════════════════════════════════════════════════════════════
function ReportsTab({ stats }: { stats: AdminStats }) {
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleExportPDF = async () => {
    setDownloadingPdf(true);
    try {
      await generateSemesterPdfReport();
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export semester PDF report.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExportCSV = async () => {
    setDownloadingCsv(true);
    try {
      const res = await fetch("/api/finance/ledger?limit=500");
      const data = await res.json();
      if (!data.success || !Array.isArray(data.transactions)) {
        alert("Failed to export report");
        return;
      }

      const headers = ["Transaction Number", "Type", "Module", "Description", "Reference ID", "Semester", "Amount (INR)", "Recorded At"];
      const rows = data.transactions.map((t: Transaction & { referenceId: string; semesterPeriod: string }) => [
        t.transactionNumber,
        t.type,
        t.sourceModule,
        `"${(t.description || "").replace(/"/g, '""')}"`,
        t.referenceId || "",
        t.semesterPeriod || "",
        t.amount.toFixed(2),
        new Date(t.recordedAt).toISOString(),
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Skyline_Treasury_Semester_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Official Semester Treasury Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">Reconciled financial report with real database metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={downloadingPdf}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingPdf ? "Generating PDF..." : "Export Semester-End PDF Report"}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={downloadingCsv}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingCsv ? "CSV..." : "Export CSV"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            ["Total Members", stats.totalMembers],
            ["Active Members", stats.activeMembers],
            ["Pending Payment", stats.pendingMembers],
            ["Published Events", stats.publishedEvents],
            ["Total Merch Orders", stats.totalOrders],
            ["Pending Expense Claims", stats.pendingClaims],
            ["Total Treasury Inflow", `₹${stats.totalIncome.toFixed(2)}`],
            ["Total Treasury Outflow", `₹${stats.totalExpense.toFixed(2)}`],
            ["Net Balance Available", `₹${stats.balance.toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-col justify-between p-3.5 rounded-xl bg-blue-50/40 border border-blue-100">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <span className="text-base font-bold text-slate-900 mt-1">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SETTINGS TAB
// ══════════════════════════════════════════════════════════════
function SettingsTab() {
  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">System Integration Status</h2>
        <div className="space-y-3 text-sm">
          {[
            { label: "Prisma ORM & Database", value: "Connected to SQLite database with full relational models.", status: "ok" },
            { label: "Authentication & Role Guards", value: "Server-side JWT cookies with strict role authorization in middleware.", status: "ok" },
            { label: "Razorpay Payment Gateway", value: "Integrated with order creation and HMAC-SHA256 signature verification.", status: "ok" },
            { label: "Digital QR Code Scanner", value: "QR pass generation and contactless attendance check-in terminal.", status: "ok" },
            { label: "Unified Treasury Ledger", value: "Real-time double entry tracking across Dues, Tickets, Merch, and Claims.", status: "ok" },
          ].map((s) => (
            <div key={s.label} className="flex items-start justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div>
                <p className="font-semibold text-slate-800">{s.label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{s.value}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                ACTIVE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
