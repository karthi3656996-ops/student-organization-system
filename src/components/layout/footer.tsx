import React from "react";
import Link from "next/link";
import { Compass, ShieldCheck, GitBranch, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-blue-100 bg-[#F8FBFF] text-slate-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Skyline Student Association
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              The unified digital platform for managing campus events, memberships,
              merchandise, volunteer tasks, and finances in one place.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Odoo × NMIT Bangalore Hackathon 2026</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                  CampusHub Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#events" className="hover:text-blue-600 transition-colors">
                  Events & Ticketing
                </Link>
              </li>
              <li>
                <Link href="/#membership" className="hover:text-blue-600 transition-colors">
                  Membership & Benefits
                </Link>
              </li>
              <li>
                <Link href="/#merchandise" className="hover:text-blue-600 transition-colors">
                  Merchandise Store
                </Link>
              </li>
              <li>
                <Link href="/#fundraisers" className="hover:text-blue-600 transition-colors">
                  Fundraisers
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-blue-600 transition-colors">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Docs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/student" className="hover:text-blue-600 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-600 transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/student/login" className="hover:text-blue-600 transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-blue-600 transition-colors">
                  Admin Login
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/karthi3656996-ops/student-organization-system"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 Skyline Student Association. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline mx-0.5" />
            for Odoo × NMIT Hackathon 2026
          </p>
        </div>
      </div>
    </footer>
  );
};
