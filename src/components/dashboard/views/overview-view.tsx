"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Clock, 
  IndianRupee, 
  Plus, 
  QrCode, 
  TrendingUp, 
  MapPin, 
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  venue: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedTickets: number;
  remainingCapacity: number;
  ticketPrice: number;
  isFree: boolean;
  imageUrl?: string;
  ticketTiers?: { id: string; tierName: string; price: number; isMemberOnly: boolean }[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: "NORMAL" | "URGENT";
  publishedAt: string;
  author: {
    name: string;
    role: string;
  };
}

interface OverviewViewProps {
  events: EventItem[];
  announcements: AnnouncementItem[];
  memberCount: number;
  pendingClaims: number;
  availableBalance: number;
  totalIncome: number;
  totalExpense: number;
  onOpenCreateEvent: () => void;
  onOpenFastCheckin: () => void;
  onOpenRegisterMember: () => void;
  onOpenFinancialRequest: () => void;
  onOpenBookingModal: (event: EventItem) => void;
  onNavigateToTab: (tab: "overview" | "organizations" | "events" | "finance" | "members") => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  events,
  announcements,
  memberCount,
  pendingClaims,
  availableBalance,
  totalIncome,
  totalExpense,
  onOpenCreateEvent,
  onOpenFastCheckin,
  onOpenRegisterMember,
  onOpenFinancialRequest,
  onOpenBookingModal,
  onNavigateToTab,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-md shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-blue-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>CampusHub Unified Dashboard</span>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <span>Spring Term 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, Karthi 👋
          </h2>
          <p className="text-sm text-blue-100/90 mt-1.5 leading-relaxed">
            Here is what is happening across Skyline Student Association today. Check ticket sales, door check-ins, multi-club governance, and treasury balances in one place.
          </p>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={onOpenCreateEvent}
              className="px-4 py-2 rounded-xl bg-white text-blue-900 text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-700" />
              <span>Create Event</span>
            </button>
            <button
              onClick={onOpenFastCheckin}
              className="px-4 py-2 rounded-xl bg-blue-800/60 hover:bg-blue-800/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-200" />
              <span>Fast Check-In</span>
            </button>
            <button
              onClick={onOpenRegisterMember}
              className="px-4 py-2 rounded-xl bg-blue-800/60 hover:bg-blue-800/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-200" />
              <span>Add Member</span>
            </button>
            <button
              onClick={onOpenFinancialRequest}
              className="px-4 py-2 rounded-xl bg-blue-800/60 hover:bg-blue-800/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <IndianRupee className="w-3.5 h-3.5 text-blue-200" />
              <span>New Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Members */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Members
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{memberCount}</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified members in database</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Live Sync</span>
            <button
              onClick={() => onNavigateToTab("members")}
              className="text-blue-600 font-semibold hover:underline"
            >
              View Roster →
            </button>
          </div>
        </div>

        {/* Metric 2: Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Campus Events
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{events.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {events.length > 0 ? "Published on campus calendar" : "No live events"}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Real-time availability</span>
            <button
              onClick={() => onNavigateToTab("events")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Browse All →
            </button>
          </div>
        </div>

        {/* Metric 3: Pending Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{pendingClaims}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              Reimbursement claims pending
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-[10px] text-slate-400">Live from database</span>
            <button
              onClick={() => onNavigateToTab("finance")}
              className="text-amber-700 font-semibold hover:underline"
            >
              Review →
            </button>
          </div>
        </div>

        {/* Metric 4: Treasury Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">₹{availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Income: ₹{totalIncome.toFixed(2)} | Expense: ₹{totalExpense.toFixed(2)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Spring 2026 Audit</span>
            <button
              onClick={() => onNavigateToTab("finance")}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Ledger →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Scheduled Events + Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scheduled Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scheduled Campus Events
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time seat capacity and ticketing status from database
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToTab("events")}
                className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                View Calendar
              </Button>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500">No scheduled events found.</p>
                <Button
                  size="sm"
                  onClick={onOpenCreateEvent}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  Create First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => {
                  const percentBooked = Math.min(
                    100,
                    Math.round((event.bookedTickets / event.totalCapacity) * 100)
                  );
                  return (
                    <div
                      key={event.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">
                            {event.title}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {event.remainingCapacity} seats left
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            {new Date(event.startTime).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {event.venue}
                          </span>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="w-full max-w-xs pt-1">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Booked: {event.bookedTickets}</span>
                            <span>Cap: {event.totalCapacity}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${percentBooked}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => onOpenBookingModal(event)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          RSVP / Book
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Governance & Bulletin Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Campus Governance & Bulletins
                </h3>
                <p className="text-xs text-slate-500">
                  Official announcements broadcasted to students & committee
                </p>
              </div>
              <Link
                href="/announcements"
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                All Bulletins →
              </Link>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.title}
                      </span>
                      {item.priority === "URGENT" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {item.content}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      Posted by {item.author.name} ({item.author.role})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Snapshot & Organizations Preview */}
        <div className="space-y-4">
          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Financial Snapshot</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live DB
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Total Income</span>
                  <span className="font-semibold text-emerald-600">₹{totalIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Total Expenses</span>
                  <span className="font-semibold text-rose-600">₹{totalExpense.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ 
                      width: `${totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0}%` 
                    }} 
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right mt-1">
                  Net Balance: ₹{availableBalance.toFixed(2)}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToTab("finance")}
                className="w-full text-xs text-blue-700 border-blue-200 hover:bg-blue-50 justify-center"
              >
                Open Finance Ledger →
              </Button>
            </div>
          </div>

          {/* Quick Organizations Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Campus Organizations</h3>
              <button
                onClick={() => onNavigateToTab("organizations")}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Explore (6) →
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Skyline Student Association oversees 6 active student societies.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    SSA
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Skyline Student Association
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium">
                      Flagship Hub • {memberCount} Members
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Primary
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    SRC
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Skyline Robotics & AI
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Engineering • Active Society
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Society</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
