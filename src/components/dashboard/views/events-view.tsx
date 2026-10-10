"use client";

import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  QrCode, 
  Clock, 
  LayoutGrid, 
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventItem } from "./overview-view";

interface EventsViewProps {
  events: EventItem[];
  onOpenCreateEvent: () => void;
  onOpenFastCheckin: () => void;
  onOpenBookingModal: (event: EventItem) => void;
  loading?: boolean;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onOpenCreateEvent,
  onOpenFastCheckin,
  onOpenBookingModal,
}) => {
  const [filterType, setFilterType] = useState<"all" | "upcoming" | "past">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

  const categories = [
    { id: "all", label: "All Events" },
    { id: "flagship", label: "Flagship & Galas" },
    { id: "tech", label: "Tech & Hackathons" },
    { id: "workshops", label: "Workshops" },
    { id: "social", label: "Social & Cultural" },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Search
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter upcoming vs past
      const now = new Date().getTime();
      const eventTime = new Date(ev.startTime).getTime();

      if (filterType === "upcoming" && eventTime < now) return false;
      if (filterType === "past" && eventTime >= now) return false;

      return true;
    });
  }, [events, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Campus Events & Ticketing
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {events.length} Live in Database
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse schedule, manage capacity caps, issue member-discount tickets, and conduct fast door check-in.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFastCheckin}
            className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            Fast Check-In
          </Button>
          <Button
            size="sm"
            onClick={onOpenCreateEvent}
            className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-sm shadow-blue-600/20 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Time Filter Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType("upcoming")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === "upcoming" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilterType("past")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === "past" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Past
            </button>
          </div>

          {/* Search & View Mode */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search event name, venue, speaker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-blue-700 shadow-sm" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "calendar" ? "bg-white text-blue-700 shadow-sm" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Calendar Timeline"
              >
                <CalendarDays className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid / Calendar View */}
      {viewMode === "calendar" ? (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Spring Semester 2026 Timeline
            </h3>
            <span className="text-xs text-slate-500">Sorted Chronologically</span>
          </div>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/40 border border-blue-100 hover:border-blue-300 transition-colors"
              >
                <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-sm">
                  <span className="text-xs uppercase tracking-wider text-blue-200">
                    {new Date(event.startTime).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-lg leading-none">
                    {new Date(event.startTime).getDate()}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {event.remainingCapacity} seats left
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {event.venue}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onOpenBookingModal(event)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0 self-center"
                >
                  Book Pass
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-8">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No events matched</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filter tags.</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const percentBooked = Math.min(
                100,
                Math.round((event.bookedTickets / event.totalCapacity) * 100)
              );

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-blue-100 hover:border-blue-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Event Cover Banner */}
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-100 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.imageUrl || "/images/events/default-event.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/events/default-event.svg";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/90 text-white shadow-sm backdrop-blur-md">
                          {event.remainingCapacity} Available
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {new Date(event.startTime).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Attendance Capacity</span>
                        <span className="font-semibold text-slate-800">
                          {event.bookedTickets} / {event.totalCapacity} ({percentBooked}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${percentBooked}%` }}
                        />
                      </div>
                    </div>

                    {/* Ticket Tiers Preview */}
                    {event.ticketTiers && event.ticketTiers.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Pricing:</span>
                        <div className="flex gap-2">
                          <span className="font-semibold text-blue-700">
                            ${Number(event.ticketTiers[0].price).toFixed(0)} Member
                          </span>
                          {event.ticketTiers[1] && (
                            <span className="text-slate-600 font-medium">
                              • ${Number(event.ticketTiers[1].price).toFixed(0)} Guest
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onOpenBookingModal(event)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs justify-center"
                    >
                      RSVP / Book Ticket
                    </Button>
                    <button
                      onClick={onOpenFastCheckin}
                      title="Gate Scanner"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
