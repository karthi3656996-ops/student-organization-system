"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, CreditCard, Calendar, ShoppingBag, LogOut,
  CheckCircle2, Clock, AlertCircle, QrCode, MapPin,
  ChevronRight, LayoutDashboard, ShieldCheck, Package,
  GraduationCap, Phone, Mail, BookOpen, Sparkles
} from "lucide-react";
import { QRCodeDisplay } from "@/components/ui/qr-code";
import { RazorpayCheckoutModal } from "@/components/payments/razorpay-checkout-modal";
import { EventBookingModal } from "@/components/events/event-booking-modal";
import { Button } from "@/components/ui/button";

interface StudentUser { id: string; name: string; email: string; role: string; createdAt: string; }
interface MemberData {
  id: string; studentId: string; department: string; graduationYear: number;
  phoneNumber: string; status: string; validFrom: string | null; validUntil: string | null;
  memberQrToken: string;
  payments: { id: string; academicYear: string; amount: number; paymentMethod: string; status: string; paidAt: string }[];
}
interface Booking {
  id: string; bookingReference: string; totalAmount: number; paymentStatus: string; createdAt: string;
  event: { title: string; venue: string; startTime: string };
  tickets: { ticketCode: string; attendeeName: string; isCheckedIn: boolean }[];
}
interface Order {
  id: string; orderNumber: string; totalAmount: number; paymentStatus: string;
  fulfillmentStatus: string; pickupCode: string; createdAt: string;
  items: { quantity: number; unitPrice: number; variant: { size: string; color: string; merchItem: { name: string } } }[];
}
interface EventItem {
  id: string; title: string; slug: string; venue: string;
  startTime: string; endTime: string; totalCapacity: number;
  bookedTickets: number; remainingCapacity: number;
  imageUrl?: string;
  ticketTiers: { id: string; tierName: string; price: number; isMemberOnly: boolean; capacityLimit: number | null }[];
}

interface StudentPortalProps {
  user: StudentUser; member: MemberData | null;
  bookings: Booking[]; orders: Order[]; upcomingEvents: EventItem[];
  initialTab?: string;
}

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "membership", label: "Membership", icon: ShieldCheck },
  { key: "events", label: "Events", icon: Calendar },
  { key: "bookings", label: "My Bookings", icon: CreditCard },
  { key: "merch", label: "Merchandise", icon: ShoppingBag },
  { key: "orders", label: "My Orders", icon: Package },
  { key: "profile", label: "Profile", icon: User },
];

export default function StudentPortal({ user, member, bookings, orders, upcomingEvents, initialTab = "dashboard" }: StudentPortalProps) {
  const router = useRouter();
  const validInitialTab = tabs.some((t) => t.key === initialTab) ? initialTab : "dashboard";
  const [activeTab, setActiveTab] = useState(validInitialTab);

  React.useEffect(() => {
    if (initialTab && tabs.some((t) => t.key === initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", key);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const statusColor = (s: string) =>
    s === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s === "PENDING_PAYMENT" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-blue-100 flex flex-col shrink-0 hidden md:flex">
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-blue-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 truncate">My Portal</p>
            <p className="text-[10px] text-blue-600 font-semibold">Skyline SSA</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key} onClick={() => handleTabChange(key)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-blue-100 space-y-1">
          <div className="px-2.5 py-2 rounded-xl bg-blue-50 mb-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{member?.studentId ?? "No Student ID"}</p>
            {member && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border inline-block mt-1 ${statusColor(member.status)}`}>
                {member.status}
              </span>
            )}
          </div>
          {(user.role === "ADMIN" || user.role === "TREASURER" || user.role === "EVENT_LEAD") && (
            <Link href="/admin" className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Admin Portal</span>
            </Link>
          )}
          <Link href="/" className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>CampusHub</span>
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-bold text-slate-900">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500">Welcome back, {user.name.split(" ")[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            {member && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor(member.status)}`}>
                {member.status === "ACTIVE" ? "✓ Active Member" : member.status === "PENDING_PAYMENT" ? "⏳ Pending Payment" : "⚠ Expired"}
              </span>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer" title="Sign Out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardTab user={user} member={member} bookings={bookings} orders={orders} setTab={handleTabChange} />}
          {activeTab === "membership" && <MembershipTab member={member} />}
          {activeTab === "events" && <EventsTab events={upcomingEvents} member={member} />}
          {activeTab === "bookings" && <BookingsTab bookings={bookings} />}
          {activeTab === "merch" && <MerchStoreTab member={member} user={user} />}
          {activeTab === "orders" && <OrdersTab orders={orders} />}
          {activeTab === "profile" && <ProfileTab user={user} member={member} />}
        </main>
      </div>
    </div>
  );
}

/* ── Dashboard Tab ─────────────────────────────────────── */
function DashboardTab({ user, member, bookings, orders, setTab }: {
  user: StudentUser; member: MemberData | null;
  bookings: Booking[]; orders: Order[];
  setTab: (t: string) => void;
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm">
        <h2 className="text-xl font-bold">Hello, {user.name.split(" ")[0]}! 👋</h2>
        <p className="text-blue-100 text-sm mt-1">Here&apos;s your Skyline Student Association overview.</p>
        {member && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3.5 py-2 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            {member.studentId} — {member.status === "ACTIVE" ? "Active Member" : member.status}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Membership", value: member?.status ?? "Not Registered", icon: ShieldCheck, color: member?.status === "ACTIVE" ? "emerald" : "amber" },
          { label: "Ticket Bookings", value: bookings.length.toString(), icon: Calendar, color: "blue" },
          { label: "Merch Orders", value: orders.length.toString(), icon: ShoppingBag, color: "indigo" },
          { label: "Valid Until", value: member?.validUntil ? new Date(member.validUntil).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—", icon: CreditCard, color: "blue" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Membership Status Alert Card */}
      {member && member.status !== "ACTIVE" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Membership Payment Pending</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your membership profile is registered but not yet activated. Pay your annual dues to unlock member benefits,
              discounted tickets, and exclusive events.
            </p>
            <button onClick={() => setTab("membership")}
              className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer">
              Activate Membership (₹499) →
            </button>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Recent Bookings</h3>
          <button onClick={() => setTab("bookings")} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">View all →</button>
        </div>
        {bookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No bookings yet. Browse upcoming events!</p>
        ) : bookings.slice(0, 3).map((b) => (
          <div key={b.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
            <div>
              <p className="text-xs font-semibold text-slate-800">{b.event.title}</p>
              <p className="text-[10px] text-slate-400">{b.bookingReference} • {new Date(b.event.startTime).toLocaleDateString()}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.paymentStatus === "PAID" || b.paymentStatus === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {b.paymentStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Membership Tab ────────────────────────────────────── */
function MembershipTab({ member }: { member: MemberData | null }) {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!member) {
    return (
      <div className="animate-fade-in bg-white rounded-2xl border border-blue-100 p-10 text-center shadow-sm">
        <ShieldCheck className="w-10 h-10 text-blue-200 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-1">No Membership Found</h2>
        <p className="text-sm text-slate-500">Your account doesn&apos;t have a membership profile yet.</p>
        <Link href="/student/register" className="mt-4 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
          Register Membership
        </Link>
      </div>
    );
  }

  const isPending = member.status !== "ACTIVE";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Official Membership Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your verified digital credential for Skyline Student Association</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              member.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : member.status === "PENDING_PAYMENT" ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>{member.status}</span>

            {isPending && (
              <Button
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Pay Dues (₹499)
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Student ID", value: member.studentId, icon: BookOpen },
            { label: "Department", value: member.department, icon: GraduationCap },
            { label: "Graduation Year", value: member.graduationYear.toString(), icon: GraduationCap },
            { label: "Phone", value: member.phoneNumber, icon: Phone },
            { label: "Valid From", value: member.validFrom ? new Date(member.validFrom).toLocaleDateString() : "Pending", icon: CheckCircle2 },
            { label: "Valid Until", value: member.validUntil ? new Date(member.validUntil).toLocaleDateString() : "Pending", icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Real QR Code display */}
        <div className="mt-5 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center gap-5">
          <QRCodeDisplay value={member.memberQrToken || member.studentId} size={130} />
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Verified Member Entry QR</span>
            </div>
            <p className="font-mono text-xs text-blue-900 font-semibold">{member.memberQrToken}</p>
            <p className="text-xs text-slate-600 max-w-md">
              Present this encrypted QR code at event entrances, voting booths, and merchandise pickup desks for verified member access.
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Payment & Dues Ledger</h3>
        {member.payments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400">No payment records found.</p>
            {isPending && (
              <Button
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Pay Annual Membership (₹499)
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {member.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Academic Year: {p.academicYear}</p>
                  <p className="text-[10px] text-slate-400">{p.paymentMethod} • {new Date(p.paidAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">₹{p.amount.toFixed(2)}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Razorpay Checkout Modal */}
      {showPaymentModal && (
        <RazorpayCheckoutModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Skyline SSA Annual Membership 2025-2026"
          amount={499}
          purpose="MEMBERSHIP"
          memberId={member.id}
          studentId={member.studentId}
          onSuccess={() => {
            setShowPaymentModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ── Events Tab ────────────────────────────────────────── */
function EventsTab({ events, member }: { events: EventItem[]; member: MemberData | null }) {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const isMember = member?.status === "ACTIVE";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Upcoming Events</h2>
        <p className="text-xs text-slate-500 mb-4">
          {isMember ? "You're a verified member — member discounts are automatically applied." : "Join or activate membership to unlock member-tier discounts."}
        </p>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No upcoming events published yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors bg-white flex flex-col justify-between">
                <div>
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-100 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ev.imageUrl || "/images/events/default-event.svg"}
                      alt={ev.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/events/default-event.svg";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${ev.remainingCapacity > 0 ? "bg-blue-600/90 text-white" : "bg-rose-600/90 text-white"}`}>
                        {ev.remainingCapacity > 0 ? `${ev.remainingCapacity} seats left` : "SOLD OUT"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ev.startTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.venue}</span>
                  </div>
                </div>
                {/* Ticket Tiers */}
                <div className="space-y-1.5 mb-3">
                  {ev.ticketTiers.map((tier) => (
                    <div key={tier.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${tier.isMemberOnly && !isMember ? "bg-slate-50 opacity-60" : "bg-blue-50/60"}`}>
                      <span className="font-medium text-slate-700">
                        {tier.tierName}
                        {tier.isMemberOnly && <span className="ml-1.5 text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">MEMBERS</span>}
                      </span>
                      <span className="font-bold text-blue-700">₹{tier.price === 0 ? "FREE" : tier.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedEventId(ev.id)}
                  disabled={ev.remainingCapacity === 0}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  Book Tickets <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEventId && (
        <EventBookingModal
          isOpen={Boolean(selectedEventId)}
          onClose={() => setSelectedEventId(null)}
          preselectedEventId={selectedEventId}
          onSuccess={() => {
            setSelectedEventId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ── Bookings Tab ──────────────────────────────────────── */
function BookingsTab({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [payBooking, setPayBooking] = useState<Booking | null>(null);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">My Ticket Bookings & QR Passes</h2>
        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 text-blue-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No bookings yet. Browse upcoming events to reserve your tickets.</p>
          </div>
        ) : bookings.map((b) => (
          <div key={b.id} className="p-4 rounded-xl border border-slate-100 mb-4 last:mb-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-sm font-bold text-slate-900">{b.event.title}</p>
                <p className="text-xs text-slate-500">{b.event.venue} • {new Date(b.event.startTime).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${
                b.paymentStatus === "PAID" || b.paymentStatus === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>{b.paymentStatus}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="font-mono font-semibold text-blue-700">{b.bookingReference}</span>
              <span>Total: <strong className="text-slate-800">₹{b.totalAmount.toFixed(2)}</strong></span>
              <span>{b.tickets.length} ticket(s)</span>
            </div>

            {/* If payment is pending: Show retry/pay button and alert, NO entry QR codes */}
            {b.paymentStatus === "PENDING_PAYMENT" ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Payment Pending Verification</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Entry passes will activate immediately upon verified payment completion.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPayBooking(b)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Pay ₹{b.totalAmount.toFixed(2)} Now →
                </button>
              </div>
            ) : (
              /* Individual tickets with real QR codes for PAID/CONFIRMED bookings */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {b.tickets.filter((t) => !t.ticketCode.startsWith("PENDING-")).map((t) => (
                  <div key={t.ticketCode} className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center gap-3">
                    <QRCodeDisplay value={t.ticketCode} size={80} />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-blue-600 block">Digital Event Ticket</span>
                      <p className="text-xs font-mono font-bold text-slate-900 truncate">{t.ticketCode}</p>
                      <p className="text-xs text-slate-600 truncate">{t.attendeeName}</p>
                      <span className={`text-[10px] font-bold mt-1 inline-block ${t.isCheckedIn ? "text-emerald-600" : "text-amber-600"}`}>
                        {t.isCheckedIn ? "✓ Admitted" : "Ready for Check-In"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {payBooking && (
        <RazorpayCheckoutModal
          isOpen={Boolean(payBooking)}
          onClose={() => setPayBooking(null)}
          title={`Ticket Pass: ${payBooking.event.title}`}
          amount={payBooking.totalAmount}
          purpose="EVENT_TICKET"
          referenceId={payBooking.bookingReference}
          onSuccess={() => {
            setPayBooking(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ── Merch Store Tab ───────────────────────────────────── */
function MerchStoreTab({ member }: { member: MemberData | null; user: StudentUser }) {
  const router = useRouter();
  const [items, setItems] = React.useState<{ id: string; name: string; description: string; imageUrl?: string; basePrice: number; memberPrice: number; variants: { id: string; size: string; stockQuantity: number }[] }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checkoutItem, setCheckoutItem] = React.useState<{ id: string; name: string; price: number; variantId: string } | null>(null);

  const isMember = member?.status === "ACTIVE";

  React.useEffect(() => {
    fetch("/api/merch").then((r) => r.json())
      .then((d) => { if (d.success) setItems(d.items); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Merchandise Store</h2>
            {isMember && <p className="text-xs text-emerald-600 font-semibold mt-0.5">✓ Member discounts applied</p>}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag className="w-10 h-10 text-blue-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No merchandise available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => {
              const price = isMember ? item.memberPrice : item.basePrice;
              const totalStock = item.variants.reduce((s, v) => s + v.stockQuantity, 0);
              const firstVariant = item.variants.find((v) => v.stockQuantity > 0) || item.variants[0];

              return (
                <div key={item.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100 flex items-center justify-center relative p-2 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || "/images/merch/default-merch.svg"}
                        alt={item.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/merch/default-merch.svg";
                        }}
                      />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-sm font-bold text-blue-700">₹{price.toFixed(2)}</span>
                      {isMember && item.memberPrice < item.basePrice && (
                        <span className="ml-2 text-xs text-slate-400 line-through">₹{item.basePrice.toFixed(2)}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold ${totalStock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.variants.map((v) => (
                      <span key={v.id} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${v.stockQuantity > 0 ? "border-blue-200 text-blue-700 bg-blue-50" : "border-slate-200 text-slate-400 bg-slate-50"}`}>
                        {v.size}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    disabled={totalStock === 0}
                    onClick={() => {
                      if (firstVariant) {
                        setCheckoutItem({
                          id: item.id,
                          name: item.name,
                          price,
                          variantId: firstVariant.id,
                        });
                      }
                    }}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    {totalStock > 0 ? `Buy Now (₹${price.toFixed(2)})` : "Out of Stock"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {checkoutItem && (
        <RazorpayCheckoutModal
          isOpen={Boolean(checkoutItem)}
          onClose={() => setCheckoutItem(null)}
          title={`Order: ${checkoutItem.name}`}
          amount={checkoutItem.price}
          purpose="MERCHANDISE"
          referenceId={`ORD-${Date.now().toString(36).toUpperCase()}`}
          metadata={{
            itemId: checkoutItem.id,
            variantId: checkoutItem.variantId,
          }}
          onSuccess={() => {
            setCheckoutItem(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ── Orders Tab ────────────────────────────────────────── */
function OrdersTab({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">My Merchandise Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-10 h-10 text-blue-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No orders yet.</p>
          </div>
        ) : orders.map((o) => (
          <div key={o.id} className="p-4 rounded-xl border border-slate-100 mb-3 last:mb-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-sm font-bold text-slate-900 font-mono">{o.orderNumber}</p>
                <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${
                o.fulfillmentStatus === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : o.fulfillmentStatus === "READY_FOR_PICKUP" ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>{o.fulfillmentStatus}</span>
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Total: <strong className="text-slate-800">₹{o.totalAmount.toFixed(2)}</strong>
              {o.pickupCode && <span className="ml-3">Pickup Code: <strong className="font-mono text-blue-700">{o.pickupCode}</strong></span>}
            </div>
            <div className="space-y-1">
              {o.items.map((i, idx) => (
                <p key={idx} className="text-xs text-slate-600">
                  {i.variant.merchItem.name} ({i.variant.size}) × {i.quantity} — ₹{(i.unitPrice * i.quantity).toFixed(2)}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Profile Tab ───────────────────────────────────────── */
function ProfileTab({ user, member }: { user: StudentUser; member: MemberData | null }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full mt-1 inline-block">{user.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: "Full Name", value: user.name, icon: User },
            { label: "Email", value: user.email, icon: Mail },
            { label: "Student ID", value: member?.studentId ?? "—", icon: BookOpen },
            { label: "Department", value: member?.department ?? "—", icon: GraduationCap },
            { label: "Grad Year", value: member?.graduationYear?.toString() ?? "—", icon: GraduationCap },
            { label: "Phone", value: member?.phoneNumber ?? "—", icon: Phone },
            { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString(), icon: CheckCircle2 },
            { label: "Valid Until", value: member?.validUntil ? new Date(member.validUntil).toLocaleDateString() : "—", icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <Icon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
