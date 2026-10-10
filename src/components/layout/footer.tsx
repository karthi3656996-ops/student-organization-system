import React from "react";
import { Compass, ShieldCheck, Heart, GitBranch } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Skyline Student Association
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The digital backbone running campus events, memberships, merchandise, volunteer tasks, and finances in one unified place.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Odoo x NMIT Bangalore Hackathon 2026</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#events" className="hover:text-white transition-colors">Spring Gala & Events</a></li>
              <li><a href="#membership" className="hover:text-white transition-colors">Membership & Benefits</a></li>
              <li><a href="#merchandise" className="hover:text-white transition-colors">Club Apparel & Hoodies</a></li>
              <li><a href="#fundraisers" className="hover:text-white transition-colors">Bake Sale & Fundraisers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Leadership & Finance
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#finance" className="hover:text-white transition-colors">Treasurer Balance Ledger</a></li>
              <li><a href="#volunteer" className="hover:text-white transition-colors">Volunteer Reimbursements</a></li>
              <li><a href="#announcements" className="hover:text-white transition-colors">Announcements Bulletin</a></li>
              <li>
                <a 
                  href="https://github.com/karthi3656996-ops/student-organization-system" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Skyline Student Association. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Odoo x NMIT Hackathon with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
