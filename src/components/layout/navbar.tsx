"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Compass, 
  Calendar, 
  Users, 
  ShoppingBag, 
  HeartHandshake, 
  Bell, 
  Menu, 
  X, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Events", href: "#events", icon: Calendar },
    { name: "Membership", href: "#membership", icon: Users },
    { name: "Merchandise", href: "#merchandise", icon: ShoppingBag },
    { name: "Fundraisers", href: "#fundraisers", icon: HeartHandshake },
    { name: "Announcements", href: "#announcements", icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                Skyline
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 block">
                Student Association
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="#membership">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="#membership">
              <Button variant="gradient" size="sm" className="gap-1.5">
                Join Skyline
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80 hover:text-white"
              >
                <Icon className="w-5 h-5 text-indigo-400" />
                {link.name}
              </a>
            );
          })}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            <Link href="#membership" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Member Sign In
              </Button>
            </Link>
            <Link href="#membership" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gradient" className="w-full justify-center">
                Join the Association
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
