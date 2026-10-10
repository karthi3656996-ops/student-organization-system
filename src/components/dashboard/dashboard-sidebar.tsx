"use client";

import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  IndianRupee, 
  Users, 
  Bell, 
  Home, 
  ShieldCheck,
  ArrowUpRight
} from "lucide-react";

export type DashboardTab = "overview" | "organizations" | "events" | "finance" | "members";

interface DashboardSidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unreadAnnouncementsCount?: number;
  upcomingEventsCount?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadAnnouncementsCount = 2,
  upcomingEventsCount = 4,
}) => {
  const menuItems = [
    {
      id: "overview" as DashboardTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "organizations" as DashboardTab,
      label: "Organizations",
      icon: Building2,
      badge: "6 Clubs",
    },
    {
      id: "events" as DashboardTab,
      label: "Events",
      icon: Calendar,
      badge: upcomingEventsCount > 0 ? `${upcomingEventsCount} Live` : null,
    },
    {
      id: "finance" as DashboardTab,
      label: "Finance",
      icon: IndianRupee,
      badge: "Ledger",
    },
    {
      id: "members" as DashboardTab,
      label: "Members",
      icon: Users,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-full min-h-[calc(100vh-4rem)] p-4 shadow-sm shrink-0">
      <div className="space-y-6">
        {/* Brand / Hub Header */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">
                  CampusHub
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">
                  v2.6
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                Skyline Student Association
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Campus Management
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Links */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Campus Services
          </p>
          <Link
            href="/announcements"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Announcements</span>
            </div>
            {unreadAnnouncementsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </Link>

          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-slate-400" />
              <span>Skyline Main Portal</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* User / Session Profile Card at Bottom */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              KM
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                Karthi M.S.
              </span>
              <span className="text-[10px] text-blue-600 font-medium block">
                Lead Administrator
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
        </div>
      </div>
    </aside>
  );
};
