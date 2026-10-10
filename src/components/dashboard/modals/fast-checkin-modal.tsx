"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw } from "lucide-react";

interface FastCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckinSuccess?: () => void;
}

interface CheckinResult {
  ticketCode: string;
  attendeeName: string;
  eventTitle: string;
  checkedInAt: string;
}

export const FastCheckinModal: React.FC<FastCheckinModalProps> = ({
  isOpen,
  onClose,
  onCheckinSuccess,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckinResult | null>(null);

  const handleCheckin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a ticket code or scan a QR token.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tickets/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Ticket is already checked in! Duplicate entry rejected.");
        }
        throw new Error(data.error || "Check-in failed. Invalid ticket code.");
      }

      setResult(data.ticket);
      if (onCheckinSuccess) {
        onCheckinSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to perform check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setError(null);
    setResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Door Check-In & Gate Scanner"
      description="Scan or enter an attendee's QR ticket code for instant contactless entry."
      maxWidth="md"
    >
      <div className="space-y-4">
        {result ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block">
                Verification Successful
              </span>
              <h4 className="text-xl font-bold text-white mt-1">{result.attendeeName}</h4>
              <p className="text-sm text-slate-700 mt-0.5">{result.eventTitle}</p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-900/60 rounded-xl py-2 px-3 inline-block">
              Ticket: <span className="font-mono text-emerald-300">{result.ticketCode}</span>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Next Attendee
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-400" />
                Ticket Code or QR Hash
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. TCK-..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium shrink-0"
                >
                  {loading ? "Checking..." : "Verify Entry"}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Database Verification:</span>
              </div>
              <p>
                Validates ticket authenticity in real-time. Immediately flags already checked-in tickets to prevent door pass reuse.
              </p>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
