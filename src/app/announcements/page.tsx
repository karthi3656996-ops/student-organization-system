"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle2, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  audience: string;
  publishedAt: string;
  author: {
    id: string;
    name: string;
    role: string;
  };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audienceFilter, setAudienceFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [audience, setAudience] = useState("ALL");
  const [authorEmail, setAuthorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const url = audienceFilter === "ALL" ? "/api/announcements" : `/api/announcements?audience=${audienceFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  }, [audienceFilter]);

  useEffect(() => {
    let ignore = false;
    const url = audienceFilter === "ALL" ? "/api/announcements" : `/api/announcements?audience=${audienceFilter}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setAnnouncements(data.announcements);
        }
      })
      .catch((err) => console.error("Failed to load announcements:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [audienceFilter]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          priority,
          audience,
          authorEmail: authorEmail.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish announcement.");
      }

      setActionSuccess("Announcement published successfully to bulletin!");
      setTitle("");
      setContent("");
      setAuthorEmail("");
      setShowCreateModal(false);
      await fetchAnnouncements();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess("Announcement deleted from bulletin.");
        await fetchAnnouncements();
      }
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F0F7FF] text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 border border-blue-200 px-3 py-1 rounded-full">
            Official Bulletin Archive
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Announcements & Circulars
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Verified campus notices and member updates replacing cluttered messaging chats.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            {showCreateModal ? "Close Form" : "New Circular"}
          </button>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Create Form Card */}
        {showCreateModal && (
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Post New Circular Notice</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Announcements are archived in the database and linked to an authorized user record.
            </p>

            {formError && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <Input
                  placeholder="e.g. Spring Gala 2026 Ticket Sales Live"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  placeholder="Provide full announcement details, time, venue, or instructions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="NORMAL">Normal Notice</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="ALL">All Students & Guests</option>
                    <option value="MEMBERS_ONLY">Active Members Only</option>
                    <option value="VOLUNTEERS">Volunteers & Leads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author Email (Optional)</label>
                  <Input
                    placeholder="e.g. officer@skyline.edu"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Publish Circular"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-blue-100 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold px-2">Audience:</span>
          {["ALL", "MEMBERS_ONLY", "VOLUNTEERS"].map((tab) => (
            <button
              key={tab}
              onClick={() => setAudienceFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                audienceFilter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              {tab.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Announcement List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading bulletin notices...
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center text-slate-400 text-sm shadow-sm">
            <Bell className="w-8 h-8 text-blue-200 mx-auto mb-2" />
            No notices found for this audience filter.
          </div>
        ) : (
          <div className="space-y-3.5">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:border-blue-200 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === "URGENT"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {item.priority === "URGENT" ? "Urgent Alert" : "Notice"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                      {item.audience.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.publishedAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{item.content}</p>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Author: {item.author.name} ({item.author.role})</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Association Circular
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
