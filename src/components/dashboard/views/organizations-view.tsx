"use client";

import React, { useState } from "react";
import { 
  Search, 
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizationItem {
  id: string;
  name: string;
  category: "Technology" | "Robotics" | "Arts" | "Finance" | "Social";
  lead: string;
  memberCount: number;
  upcomingEvents: number;
  description: string;
  isPrimary?: boolean;
  isMember?: boolean;
  avatarColor: string;
  initials: string;
}

interface OrganizationsViewProps {
  onOpenRegisterMember: () => void;
  realMemberCount?: number;
  realEventCount?: number;
}

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({
  onOpenRegisterMember,
  realMemberCount = 128,
  realEventCount = 4,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "my" | "discover">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [managedOrg, setManagedOrg] = useState<OrganizationItem | null>(null);

  const organizations: OrganizationItem[] = [
    {
      id: "skyline-ssa",
      name: "Skyline Student Association",
      category: "Technology",
      lead: "Karthi M.S. (Lead Executive)",
      memberCount: realMemberCount,
      upcomingEvents: realEventCount,
      description:
        "The flagship student organization running campus events, engineering hackathons, merchandise, volunteer task forces, and treasury finances.",
      isPrimary: true,
      isMember: true,
      avatarColor: "from-blue-600 to-indigo-600",
      initials: "SSA",
    },
    {
      id: "skyline-robotics",
      name: "Skyline Robotics & Autonomous Systems",
      category: "Robotics",
      lead: "Dr. Arvind K. & Serena Gomez",
      memberCount: 42,
      upcomingEvents: 2,
      description:
        "Developing autonomous rovers, drone swarms, and battlebots for national collegiate robotics championships.",
      isMember: true,
      avatarColor: "from-blue-600 to-cyan-600",
      initials: "SRA",
    },
    {
      id: "skyline-ai-coding",
      name: "Skyline AI & Coding Society",
      category: "Technology",
      lead: "Jasmitha Rao",
      memberCount: 88,
      upcomingEvents: 3,
      description:
        "Open-source software, competitive programming, and generative AI research project incubators on campus.",
      isMember: false,
      avatarColor: "from-violet-600 to-blue-600",
      initials: "SCS",
    },
    {
      id: "skyline-design",
      name: "Skyline Design & Media Collective",
      category: "Arts",
      lead: "Maya Lin",
      memberCount: 35,
      upcomingEvents: 1,
      description:
        "UI/UX product design, event photography, animation, and campus promotional merchandise styling.",
      isMember: false,
      avatarColor: "from-rose-500 to-pink-600",
      initials: "SDM",
    },
    {
      id: "skyline-finance",
      name: "Skyline Finance & Trading Club",
      category: "Finance",
      lead: "Rohan V.",
      memberCount: 54,
      upcomingEvents: 1,
      description:
        "Student-run investment simulations, financial modeling bootcamps, and fintech guest speaker lectures.",
      isMember: false,
      avatarColor: "from-emerald-600 to-teal-600",
      initials: "SFT",
    },
    {
      id: "skyline-social",
      name: "Skyline Social Impact & Outreach",
      category: "Social",
      lead: "Priya Sharma",
      memberCount: 63,
      upcomingEvents: 2,
      description:
        "STEM tutoring in local community schools, environmental cleanups, and non-profit volunteer drives.",
      isMember: false,
      avatarColor: "from-amber-500 to-orange-600",
      initials: "SSI",
    },
  ];

  const filteredOrgs = organizations.filter((org) => {
    // Search
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "my" && !org.isMember) return false;
    if (activeTab === "discover" && org.isMember) return false;

    // Category filter
    if (selectedCategory !== "all" && org.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Campus Organizations & Clubs
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              6 Active Chapters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discover student-led clubs, check membership rosters, and manage student organization governance.
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenRegisterMember}
          className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-sm shadow-blue-600/20"
        >
          Join Skyline Association
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Organizations
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "my" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Clubs (2)
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "discover" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Discover
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search club title, lead, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["all", "Technology", "Robotics", "Arts", "Finance", "Social"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap capitalize ${
                selectedCategory === cat
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice on Real vs Sample Directory Data */}
      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Skyline Student Association</strong> is the primary organization backed by live database records. Auxiliary campus chapters are presented for multi-club directory discovery.
          </span>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrgs.map((org) => (
          <div
            key={org.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
              org.isPrimary ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"
            }`}
          >
            <div className="space-y-3">
              {/* Header with avatar & category badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${org.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                  >
                    {org.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {org.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Lead: {org.lead}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {org.category}
                </span>
                {org.isPrimary && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Primary Chapter
                  </span>
                )}
                {org.isMember && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Joined
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {org.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase">Roster</span>
                  <span className="font-bold text-slate-900">{org.memberCount} Members</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase">Events</span>
                  <span className="font-bold text-slate-900">{org.upcomingEvents} Upcoming</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              {org.isMember ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setManagedOrg(org)}
                  className="w-full text-xs text-blue-700 border-blue-200 hover:bg-blue-50 justify-center"
                >
                  Manage Chapter
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onOpenRegisterMember}
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium justify-center"
                >
                  Join Organization
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manage Chapter Modal Preview */}
      {managedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-blue-100 max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Chapter Governance: {managedOrg.name}
              </h3>
              <button
                onClick={() => setManagedOrg(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Executive Lead: <strong>{managedOrg.lead}</strong>. Registered members: <strong>{managedOrg.memberCount}</strong>.
            </p>
            <div className="p-3 rounded-xl bg-blue-50 text-xs text-blue-900 space-y-1">
              <div>• Budget Allocation: Spring 2026 Chapter Grant Active</div>
              <div>• Venue Authorization: Approved for Campus Hall & Lab B</div>
              <div>• Officer Elections: Next term scheduled November 2026</div>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setManagedOrg(null)} className="bg-blue-600 text-white text-xs">
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
