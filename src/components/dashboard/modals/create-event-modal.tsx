"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Ticket, AlertCircle, CheckCircle2, Clock, Image as ImageIcon } from "lucide-react";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalCapacity, setTotalCapacity] = useState(150);
  const [memberPrice, setMemberPrice] = useState(100);
  const [guestPrice, setGuestPrice] = useState(250);
  const [imageUrl, setImageUrl] = useState("/images/events/gala.svg");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generate slug from title if user hasn't typed a custom slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !slug.trim() || !description.trim() || !venue.trim() || !startTime || !endTime) {
      setError("Please fill in all required fields.");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("Invalid date or time entered.");
      return;
    }

    if (start >= end) {
      setError("Event start time must be before end time.");
      return;
    }

    if (totalCapacity <= 0) {
      setError("Capacity must be greater than 0.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim(),
          venue: venue.trim(),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          totalCapacity: Number(totalCapacity),
          status: "PUBLISHED",
          imageUrl: imageUrl.trim() || "/images/events/default-event.svg",
          ticketTiers: [
            {
              tierName: "Member Discount Pass",
              price: Number(memberPrice),
              isMemberOnly: true,
              capacityLimit: Math.floor(Number(totalCapacity) * 0.6),
            },
            {
              tierName: "General Public / Guest",
              price: Number(guestPrice),
              isMemberOnly: false,
              capacityLimit: Number(totalCapacity),
            },
          ],
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create event");
      }

      setSuccess(true);
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Error creating event";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setVenue("");
    setStartTime("");
    setEndTime("");
    setTotalCapacity(150);
    setMemberPrice(100);
    setGuestPrice(250);
    setImageUrl("/images/events/gala.svg");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Create New Campus Event"
      description="Schedule and configure tickets for Skyline Student Association."
      maxWidth="lg"
    >
      {success ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Event Created Successfully!</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              &quot;{title}&quot; is now live on the campus events schedule with {totalCapacity} available seats.
            </p>
          </div>
          <Button size="sm" onClick={handleReset} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
            Done & Return to Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Event Title *
              </label>
              <Input
                placeholder="e.g. Spring Gala 2026"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                URL Slug / Identifier *
              </label>
              <Input
                placeholder="spring-gala-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              className="w-full h-20 rounded-xl bg-white border border-slate-300 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              placeholder="Describe event agenda, speakers, requirements, and refreshments provided..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Venue / Campus Hall *
              </label>
              <Input
                placeholder="e.g. Grand Campus Hall, Room 302"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Total Seat Capacity *
              </label>
              <Input
                type="number"
                min="1"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                End Time *
              </label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
              <Ticket className="w-4 h-4 text-blue-600" />
              <span>Ticket Tiers Configuration</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Member Price (₹)</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={memberPrice}
                  onChange={(e) => setMemberPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Guest / Public Price (₹)</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={guestPrice}
                  onChange={(e) => setGuestPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Event Cover Image Configuration */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              Event Cover Visual *
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { label: "Gala / Banquet", url: "/images/events/gala.svg" },
                { label: "Tech Hackathon", url: "/images/events/hackathon.svg" },
                { label: "Cultural Fest", url: "/images/events/cultural.svg" },
                { label: "Sports Meet", url: "/images/events/sports.svg" },
                { label: "Workshop / Lecture", url: "/images/events/workshop.svg" },
              ].map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => setImageUrl(p.url)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    imageUrl === p.url
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <Input
                placeholder="Image URL or local path (e.g. /images/events/gala.svg)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs"
              />
              {imageUrl && (
                <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/events/default-event.svg";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            >
              {loading ? "Publishing Event..." : "Publish Event"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
