"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  Users, 
  ShoppingBag, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventBookingModal } from "@/components/events/event-booking-modal";

export default function HomePage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [remainingSeats, setRemainingSeats] = useState<number>(200);

  const loadEventCapacity = useCallback(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setRemainingSeats(data.events[0].remainingCapacity);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch event capacity:", err);
      });
  }, []);

  useEffect(() => {
    loadEventCapacity();

    const handleOpenBooking = () => setIsBookingModalOpen(true);
    window.addEventListener("open-event-booking", handleOpenBooking);
    return () => window.removeEventListener("open-event-booking", handleOpenBooking);
  }, [loadEventCapacity]);
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute top-[-100px] left-[15%] w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-[50px] right-[15%] w-[450px] h-[450px] bg-violet-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-[280px] left-[40%] w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-[120px]" />
      </div>

      {/* =========================================================================
          1. HERO SECTION
         ========================================================================= */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-md shadow-lg shadow-indigo-950/40">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Odoo x NMIT Bangalore Hackathon 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-slate-400">Skyline Student Association</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Build One System to Run{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Events, Members & Money
            </span>{" "}
            in One Place.
          </h1>

          {/* Subheading from PDF */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The digital backbone for campus clubs. Eliminate messy spreadsheets, paper door lists,
            lost receipts, and chaotic WhatsApp groups with a unified, transparent operating system.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gradient"
              size="lg"
              className="w-full sm:w-auto gap-2 text-base cursor-pointer"
              onClick={() => setIsBookingModalOpen(true)}
            >
              <Calendar className="w-4 h-4" />
              Book Spring Gala 2026
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 text-base cursor-pointer"
              onClick={() => window.dispatchEvent(new CustomEvent("open-member-registration"))}
            >
              <Users className="w-4 h-4" />
              Join Membership ($15/yr)
            </Button>
          </div>

          {/* Trust & Capability Metric Cards */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Cashless Ticketing</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">&lt; 1 sec</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">QR Door Check-In</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-400">Real-Time</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Unified Treasury Ledger</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Zero Lost</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Receipts & Claims</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. EVENTS & ONLINE TICKETING (SPRING GALA SCENARIO)
         ========================================================================= */}
      <section id="events" className="py-20 border-b border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="primary" className="mb-3">
                Events & Ticketing
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Selling Tickets for the Spring Gala
              </h2>
              <p className="mt-2 text-slate-400 max-w-xl text-sm sm:text-base">
                Differential pricing for members vs. non-members, hard seat capacity caps, and instant door QR scanning without paper lists.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <QrCode className="w-4 h-4" />
                Contactless Verification Ready
              </div>
            </div>
          </div>

          {/* Flagship Event Banner Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Main Gala Card */}
            <Card glass hoverEffect className="lg:col-span-2 flex flex-col justify-between border-indigo-500/30">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <Badge variant="purple">Flagship Event of the Year</Badge>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Seats Remaining: {remainingSeats} / 200
                  </span>
                </div>

                <CardTitle className="text-2xl sm:text-3xl text-white">
                  Skyline Annual Spring Gala 2026
                </CardTitle>
                <CardDescription className="mt-2 text-slate-300">
                  An evening of live campus performances, awards ceremony, and network dinner. Tickets are available online 24/7 with direct mobile passes.
                </CardDescription>

                {/* Event Metadata */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="text-xs text-slate-400">Date</div>
                      <div className="text-sm font-semibold text-white">April 18, 2026</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="text-xs text-slate-400">Time</div>
                      <div className="text-sm font-semibold text-white">6:30 PM - 10:30 PM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="text-xs text-slate-400">Venue</div>
                      <div className="text-sm font-semibold text-white">Grand Campus Hall</div>
                    </div>
                  </div>
                </div>

                {/* Pricing Comparison */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 to-slate-900/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Club Member Price</span>
                      <Badge variant="primary">$10.00</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Active Skyline members save 60% with automatic discount applied.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">General Public / Guest</span>
                      <span className="text-sm font-bold text-white">$25.00</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Open to all university students, faculty, and invited guests.</p>
                  </div>
                </div>
              </div>

              <CardFooter className="mt-8">
                <span className="text-xs text-slate-400">Includes dinner buffet & gala access</span>
                <Button
                  variant="gradient"
                  className="gap-2 cursor-pointer"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Book Tickets Online
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Door Fast Check-In Feature Preview */}
            <Card glass className="flex flex-col justify-between">
              <div>
                <Badge variant="secondary" className="mb-3">Door Operations</Badge>
                <CardTitle className="text-xl">Instant Door QR Verification</CardTitle>
                <CardDescription className="mt-2">
                  No paper checklists. Door volunteers use the mobile scanner to validate tickets in under a second.
                </CardDescription>

                <div className="my-6 p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-lg bg-white p-2.5 flex items-center justify-center shadow-lg">
                    <QrCode className="w-full h-full text-slate-950" />
                  </div>
                  <div className="mt-4 text-xs font-mono text-indigo-300 bg-indigo-950/50 px-2.5 py-1 rounded border border-indigo-800/40">
                    PASS-2026-GALA-8921
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified Member: Sarah Chen
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Prevents duplicate / copied ticket re-entry
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Real-time turnout & revenue reporting
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <Button variant="outline" className="w-full justify-center text-xs">
                  Launch Staff Door Scanner
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MEMBERSHIP MANAGEMENT & BENEFITS SCENARIO
         ========================================================================= */}
      <section id="membership" className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="purple" className="mb-3">Membership Management</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A New Student Joins Skyline
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Whether signing up at a table on campus or online from a phone: track dues, unlock discounts on tickets & merchandise, and get renewal alerts before membership lapses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Sign up & Digital ID */}
            <Card glass hoverEffect>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Campus Table & Online Sign-up</CardTitle>
              <CardDescription className="mt-2">
                Quick-entry kiosk mode for registration tables during campus club fairs. Collects student IDs, department, and contact details in seconds.
              </CardDescription>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Instant Digital Member ID pass
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Online or Cash table dues recording
                </li>
              </ul>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-member-registration"))}
                >
                  Open Table Registration
                </Button>
              </div>
            </Card>

            {/* Feature 2: Member Benefits & Discounts */}
            <Card glass hoverEffect className="border-indigo-500/40 bg-gradient-to-b from-slate-900/90 to-indigo-950/30">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Award className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Automatic Member Perks</CardTitle>
              <CardDescription className="mt-2">
                Active membership immediately unlocks discounted ticket pricing and exclusive merchandise rates across the entire website.
              </CardDescription>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  $15 off Gala tickets ($10 vs $25)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  $10 off club hoodie & apparel drops
                </li>
              </ul>
            </Card>

            {/* Feature 3: Expiry & Renewal Reminders */}
            <Card glass hoverEffect>
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">Expiry & Renewal Alerts</CardTitle>
              <CardDescription className="mt-2">
                Memberships run through the academic year. Automated notifications alert students 30 days and 7 days prior to expiry so benefits never lapse.
              </CardDescription>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  One-click online renewal workflow
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Instant door verification for staff
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. MERCHANDISE & SIZE INVENTORY SCENARIO
         ========================================================================= */}
      <section id="merchandise" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="warning" className="mb-3">Merchandise & Commerce</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ordering Hoodies for the Club
              </h2>
              <p className="mt-2 text-slate-400 max-w-xl text-sm sm:text-base">
                Members order branded apparel from their phones 24/7. Sizes and real-time stock per variant are tracked to eliminate overselling and payment chasing.
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-xs text-slate-400">
              Pick up on campus with unique digital pickup code
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Merch Item 1: Skyline Hoodie */}
            <Card glass hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="h-48 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-950/60 border border-slate-800 flex items-center justify-center relative overflow-hidden mb-5">
                  <ShoppingBag className="w-16 h-16 text-indigo-400/60" />
                  <Badge variant="primary" className="absolute top-3 right-3">New Drop</Badge>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <CardTitle className="text-lg">Skyline Signature Hoodie</CardTitle>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through mr-1.5">$45</span>
                    <span className="text-base font-bold text-emerald-400">$35 Member</span>
                  </div>
                </div>
                <CardDescription>
                  Heavyweight 380 GSM fleece with embroidered Skyline crest. Available in Midnight Black.
                </CardDescription>

                {/* Size Stock Matrix Preview */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Size Stock Status:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">S (4 left)</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">M (8 left)</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">L (2 left)</span>
                    <span className="px-2 py-1 rounded bg-slate-950/60 text-slate-500 border border-slate-800/80 line-through">XL (Sold out)</span>
                  </div>
                </div>
              </div>

              <CardFooter className="mt-6">
                <Button variant="gradient" className="w-full justify-center">
                  Select Size & Order
                </Button>
              </CardFooter>
            </Card>

            {/* Merch Item 2: Skyline T-Shirt */}
            <Card glass hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="h-48 rounded-lg bg-gradient-to-tr from-slate-900 to-blue-950/60 border border-slate-800 flex items-center justify-center relative overflow-hidden mb-5">
                  <ShoppingBag className="w-16 h-16 text-blue-400/60" />
                  <Badge variant="secondary" className="absolute top-3 right-3">Everyday</Badge>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <CardTitle className="text-lg">Association Crest T-Shirt</CardTitle>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through mr-1.5">$25</span>
                    <span className="text-base font-bold text-emerald-400">$18 Member</span>
                  </div>
                </div>
                <CardDescription>
                  100% Ring-spun organic cotton with screen-printed Skyline typography.
                </CardDescription>

                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Size Stock Status:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">S (12)</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">M (15)</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">L (11)</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">XL (5)</span>
                  </div>
                </div>
              </div>

              <CardFooter className="mt-6">
                <Button variant="outline" className="w-full justify-center">
                  Select Size & Order
                </Button>
              </CardFooter>
            </Card>

            {/* Inventory Integrity Showcase */}
            <Card glass className="flex flex-col justify-between border-slate-800 bg-slate-950/60">
              <div>
                <Badge variant="primary" className="mb-3">Stock Safeguard</Badge>
                <CardTitle className="text-lg">Real-Time Inventory Engine</CardTitle>
                <CardDescription className="mt-2">
                  Prevent overselling before payment is captured. Each size variant maintains an independent counter in the database.
                </CardDescription>

                <div className="mt-6 space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>Pre-payment verification</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>Automatic stock decrement</span>
                    <span className="text-emerald-400 font-semibold">Atomic</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>Digital pickup QR code</span>
                    <span className="text-indigo-400 font-semibold">Generated</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                Merchandise proceeds route directly into club income.
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FUNDRAISERS & VOLUNTEER TASK ASSIGNMENTS SCENARIO
         ========================================================================= */}
      <section id="fundraisers" className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="purple" className="mb-3">Fundraising & Operations</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Planning a Fundraiser (Bake Sale)
              </h2>
              <p className="mt-2 text-slate-400 max-w-xl text-sm sm:text-base">
                Who is baking, who is buying supplies, and who is managing the table. Transparent Kanban task assignments instead of disorganized group chats.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge variant="success">Campaign Goal: $500.00</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Campaign Progress Card */}
            <Card glass className="flex flex-col justify-between">
              <div>
                <CardTitle className="text-xl">Spring Campus Bake Sale</CardTitle>
                <CardDescription className="mt-2">
                  Fundraising campaign to sponsor student travel for the regional robotics convention.
                </CardDescription>

                <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-400">Raised: $370.00</span>
                    <span className="text-indigo-400">74% of $500</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: "74%" }} />
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Campaign Lead:</span>
                    <span className="text-white font-medium">Alex Rivera (VP Events)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Volunteers:</span>
                    <span className="text-white font-medium">8 Students</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasks Completed:</span>
                    <span className="text-emerald-400 font-semibold">5 / 7 Tasks Done</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <Button variant="outline" className="w-full justify-center text-xs">
                  View Full Campaign Ledger
                </Button>
              </div>
            </Card>

            {/* Kanban Preview Columns */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* To Do Column */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">To Do / In Progress (2)</span>
                  <Badge variant="warning">Active</Badge>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-sm font-semibold text-white">Buy eco packaging boxes</div>
                    <div className="text-xs text-slate-400 mt-1">Assigned: Serena Gomez</div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-amber-400">Due Tomorrow</span>
                      <span className="text-slate-500">Est. $25 expense</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-sm font-semibold text-white">Manage registration table (Slot 2)</div>
                    <div className="text-xs text-slate-400 mt-1">Assigned: Jasmitha K.</div>
                    <div className="mt-2 text-[11px] text-blue-400">Friday 2:00 PM - 4:00 PM</div>
                  </div>
                </div>
              </div>

              {/* Completed Tasks Column */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed (3)</span>
                  <Badge variant="success">Done</Badge>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 opacity-80">
                    <div className="text-sm font-semibold text-white line-through">Bake 100 vegan brownies</div>
                    <div className="text-xs text-slate-400 mt-1">Assigned: Karthi & Team</div>
                    <div className="mt-2 text-[11px] text-emerald-400 font-medium">Completed Oct 9</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 opacity-80">
                    <div className="text-sm font-semibold text-white line-through">Print allergen allergen cards</div>
                    <div className="text-xs text-slate-400 mt-1">Assigned: Michael T.</div>
                    <div className="mt-2 text-[11px] text-emerald-400 font-medium">Receipt reimbursed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TREASURER LEDGER & SEMESTER-END OVERVIEW SCENARIO
         ========================================================================= */}
      <section id="finance" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="primary" className="mb-3">Financial Backbone</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                The Treasurer, at the End of the Semester
              </h2>
              <p className="mt-2 text-slate-400 max-w-xl text-sm sm:text-base">
                Explain where the club’s money went: dues collected, tickets sold, merchandise sold, and every expense a volunteer was reimbursed for.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-800/40">
                Semester: Spring 2026 Audit
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Inflow */}
            <Card glass className="border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Money In (Inflow)</span>
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-4">$6,480.00</div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Membership Dues:</span><span className="text-white">$2,100</span></div>
                <div className="flex justify-between"><span>Gala Ticket Sales:</span><span className="text-white">$2,450</span></div>
                <div className="flex justify-between"><span>Hoodie & T-Shirt Sales:</span><span className="text-white">$1,560</span></div>
                <div className="flex justify-between"><span>Fundraisers / Bake Sale:</span><span className="text-white">$370</span></div>
              </div>
            </Card>

            {/* Total Outflow */}
            <Card glass className="border-rose-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Money Out (Outflow)</span>
                <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-rose-400 mt-4">$2,145.00</div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Venue Deposit:</span><span className="text-white">$1,200</span></div>
                <div className="flex justify-between"><span>Volunteer Reimbursements:</span><span className="text-white">$485</span></div>
                <div className="flex justify-between"><span>Bake Sale Ingredients:</span><span className="text-white">$160</span></div>
                <div className="flex justify-between"><span>Printing & Promotion:</span><span className="text-white">$300</span></div>
              </div>
            </Card>

            {/* Net Remaining Balance */}
            <Card glass className="border-indigo-500/40 bg-gradient-to-br from-slate-900 to-indigo-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Net Remaining Balance</span>
                <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mt-4">$4,335.00</div>
              <p className="text-xs text-indigo-300/80 mt-2">
                Real-time formula: Inflows - Outflows. Balanced and reconciled down to the cent.
              </p>
              <div className="mt-6 pt-3 border-t border-indigo-500/20">
                <Button variant="gradient" size="sm" className="w-full justify-center text-xs">
                  Export Semester-End PDF Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. ANNOUNCEMENTS ARCHIVE SCENARIO
         ========================================================================= */}
      <section id="announcements" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="purple" className="mb-3">Official Communications</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Announcements & Verified Bulletin
              </h2>
              <p className="mt-2 text-slate-400 max-w-xl text-sm sm:text-base">
                Replacing scattered WhatsApp messages with a permanent, timestamped record that automatically reaches the member mailing list.
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-xs text-slate-400">
              Audit log with date & sender verification
            </div>
          </div>

          <div className="space-y-4 max-w-4xl">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="danger">Urgent Notice</Badge>
                  <span className="text-xs text-slate-400">Posted Today at 9:30 AM by Secretary</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Mailed to 142 Members</span>
              </div>
              <h4 className="text-base font-bold text-white">General Body Meeting Room Shifted to Hall B</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Due to audio-visual maintenance in the main auditorium, today’s 5:00 PM General Body Meeting will be held in Hall B, Science Block.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Ticket Alert</Badge>
                  <span className="text-xs text-slate-400">Posted Oct 8 by Jasmitha (Events Lead)</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Mailed to All Members</span>
              </div>
              <h4 className="text-base font-bold text-white">Spring Gala Early-Bird Registration Closes Friday</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Member-discounted ticket slots are 75% full. Make sure to claim your discounted pass through the portal before general sales open.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Event Ticket Booking Modal */}
      <EventBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => loadEventCapacity()}
      />
    </div>
  );
}
