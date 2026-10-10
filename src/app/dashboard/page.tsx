"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardSidebar, DashboardTab } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OverviewView, EventItem, AnnouncementItem } from "@/components/dashboard/views/overview-view";
import { EventsView } from "@/components/dashboard/views/events-view";
import { OrganizationsView } from "@/components/dashboard/views/organizations-view";
import { FinanceView } from "@/components/dashboard/views/finance-view";
import { MembersView } from "@/components/dashboard/views/members-view";
import { CreateEventModal } from "@/components/dashboard/modals/create-event-modal";
import { FastCheckinModal } from "@/components/dashboard/modals/fast-checkin-modal";
import { FinancialRequestModal } from "@/components/dashboard/modals/financial-request-modal";
import { MemberRegistrationModal } from "@/components/membership/member-registration-modal";
import { EventBookingModal } from "@/components/events/event-booking-modal";

interface DashboardStats {
  activeMembers: number;
  publishedEvents: number;
  pendingClaims: number;
  totalIncome: number;
  totalExpense: number;
  availableBalance: number;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as DashboardTab) || "overview";

  const [currentTab, setCurrentTab] = useState<DashboardTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [fastCheckinOpen, setFastCheckinOpen] = useState(false);
  const [financialRequestOpen, setFinancialRequestOpen] = useState(false);
  const [financialMode, setFinancialMode] = useState<"request" | "receipt">("request");
  const [registerMemberOpen, setRegisterMemberOpen] = useState(false);
  
  // Booking Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<EventItem | null>(null);

  // Live data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [dashStats, setDashStats] = useState<DashboardStats>({
    activeMembers: 0,
    publishedEvents: 0,
    pendingClaims: 0,
    totalIncome: 0,
    totalExpense: 0,
    availableBalance: 0,
  });

  // Fetch live events from existing API
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data?.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [eventsData, announcementsData, statsData] = await Promise.all([
          fetch("/api/events").then((r) => r.json()).catch(() => null),
          fetch("/api/announcements?limit=5").then((r) => r.json()).catch(() => null),
          fetch("/api/dashboard/stats").then((r) => r.json()).catch(() => null),
        ]);

        if (!isMounted) return;

        if (eventsData?.success && Array.isArray(eventsData.events)) {
          setEvents(eventsData.events);
        }
        if (announcementsData?.success && Array.isArray(announcementsData.announcements)) {
          setAnnouncements(announcementsData.announcements);
        }
        if (statsData?.success && statsData.stats) {
          setDashStats(statsData.stats);
        }
      } catch (err) {
        console.error("Failed to load initial dashboard data:", err);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenBooking = (event: EventItem) => {
    setSelectedEventForBooking(event);
    setBookingModalOpen(true);
  };

  const titles: Record<DashboardTab, { title: string; subtitle: string }> = {
    overview: {
      title: "CampusHub Overview",
      subtitle: "Unified operations console for Skyline Student Association",
    },
    organizations: {
      title: "Organizations & Clubs Directory",
      subtitle: "Multi-club roster and campus student societies governance",
    },
    events: {
      title: "Campus Events & Ticketing",
      subtitle: "Seat capacity caps, member ticket pricing, and fast door check-in",
    },
    finance: {
      title: "Treasury & Finance Management",
      subtitle: "Reconciled double-entry ledger, expense claims, and budget utilization",
    },
    members: {
      title: "Members & Identity Management",
      subtitle: "Student verification, academic credentials, and annual dues tracking",
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadAnnouncementsCount={announcements.length}
        upcomingEventsCount={events.length}
      />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title={titles[currentTab].title}
          subtitle={titles[currentTab].subtitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateEvent={() => setCreateEventOpen(true)}
          onOpenFastCheckin={() => setFastCheckinOpen(true)}
          onOpenRegisterMember={() => setRegisterMemberOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === "overview" && (
            <OverviewView
              events={events}
              announcements={announcements}
              onOpenCreateEvent={() => setCreateEventOpen(true)}
              onOpenFastCheckin={() => setFastCheckinOpen(true)}
              onOpenRegisterMember={() => setRegisterMemberOpen(true)}
              onOpenFinancialRequest={() => {
                setFinancialMode("request");
                setFinancialRequestOpen(true);
              }}
              onOpenBookingModal={handleOpenBooking}
              onNavigateToTab={setCurrentTab}
              memberCount={dashStats.activeMembers}
              pendingClaims={dashStats.pendingClaims}
              availableBalance={dashStats.availableBalance}
              totalIncome={dashStats.totalIncome}
              totalExpense={dashStats.totalExpense}
            />
          )}

          {currentTab === "organizations" && (
            <OrganizationsView
              onOpenRegisterMember={() => setRegisterMemberOpen(true)}
              realMemberCount={dashStats.activeMembers}
              realEventCount={events.length}
            />
          )}

          {currentTab === "events" && (
            <EventsView
              events={events}
              onOpenCreateEvent={() => setCreateEventOpen(true)}
              onOpenFastCheckin={() => setFastCheckinOpen(true)}
              onOpenBookingModal={handleOpenBooking}
            />
          )}

          {currentTab === "finance" && (
            <FinanceView
              onOpenNewRequest={() => {
                setFinancialMode("request");
                setFinancialRequestOpen(true);
              }}
              onOpenUploadReceipt={() => {
                setFinancialMode("receipt");
                setFinancialRequestOpen(true);
              }}
            />
          )}

          {currentTab === "members" && (
            <MembersView onOpenRegisterMember={() => setRegisterMemberOpen(true)} />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onEventCreated={fetchEvents}
      />

      <FastCheckinModal
        isOpen={fastCheckinOpen}
        onClose={() => setFastCheckinOpen(false)}
        onCheckinSuccess={fetchEvents}
      />

      <FinancialRequestModal
        isOpen={financialRequestOpen}
        onClose={() => setFinancialRequestOpen(false)}
        defaultMode={financialMode}
      />

      <MemberRegistrationModal
        isOpen={registerMemberOpen}
        onClose={() => setRegisterMemberOpen(false)}
      />

      <EventBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedEventForBooking(null);
        }}
        preselectedEventId={selectedEventForBooking?.id}
        onSuccess={() => {
          fetchEvents();
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading CampusHub...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
