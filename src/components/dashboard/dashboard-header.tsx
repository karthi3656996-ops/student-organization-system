"use client";

import React from "react";
import { 
  Search, 
  Plus, 
  QrCode, 
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateEvent: () => void;
  onOpenFastCheckin: () => void;
  onOpenRegisterMember: () => void;
  title: string;
  subtitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateEvent,
  onOpenFastCheckin,
  onOpenRegisterMember,
  title,
  subtitle,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Spring 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Search & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Universal Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CampusHub..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick Action: Register Member */}
          <button
            onClick={onOpenRegisterMember}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Add Member</span>
          </button>

          {/* Quick Action: Fast Check-in */}
          <button
            onClick={onOpenFastCheckin}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Check-In</span>
          </button>

          {/* Quick Action: Create Event */}
          <Button
            size="sm"
            onClick={onOpenCreateEvent}
            className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
