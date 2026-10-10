"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Ticket, 
  QrCode, 
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RazorpayCheckoutModal } from "@/components/payments/razorpay-checkout-modal";

export interface TicketTierOption {
  id: string;
  eventId: string;
  tierName: string;
  price: number;
  isMemberOnly: boolean;
  capacityLimit?: number | null;
  bookedTickets: number;
  remaining: number;
}

export interface AvailableEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  venue: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedTickets: number;
  remainingCapacity: number;
  ticketTiers: TicketTierOption[];
}

export interface IssuedTicket {
  ticketCode: string;
  attendeeName: string;
}

export interface BookingSuccessData {
  id: string;
  bookingReference: string;
  eventTitle: string;
  venue: string;
  startTime: string;
  tierName: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
  tickets: IssuedTicket[];
}

export interface EventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEventId?: string;
  onSuccess?: (booking: BookingSuccessData) => void;
}

interface FormErrors {
  eventId?: string;
  tierId?: string;
  quantity?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  memberStudentId?: string;
}

type SubmissionState = "idle" | "submitting" | "payment_pending" | "success" | "error";

export const EventBookingModal: React.FC<EventBookingModalProps> = ({
  isOpen,
  onClose,
  preselectedEventId,
  onSuccess,
}) => {
  const [events, setEvents] = useState<AvailableEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [attendeeName, setAttendeeName] = useState<string>("");
  const [attendeeEmail, setAttendeeEmail] = useState<string>("");
  const [memberStudentId, setMemberStudentId] = useState<string>("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSuccessData | null>(null);
  const [pendingBookingRef, setPendingBookingRef] = useState<string | null>(null);
  const [pendingTotalAmount, setPendingTotalAmount] = useState<number>(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  // Fetch events when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const eventList = Array.isArray(data) ? data : (data.events || []);
        if (Array.isArray(eventList) && eventList.length > 0) {
          setEvents(eventList);

          // Select event
          const targetEvent =
            eventList.find((e: AvailableEvent) => e.id === preselectedEventId) ||
            eventList[0];

          if (targetEvent) {
            setSelectedEventId(targetEvent.id);
            if (targetEvent.ticketTiers?.length > 0) {
              setSelectedTierId(targetEvent.ticketTiers[0].id);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load events:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, preselectedEventId]);

  const currentEvent = events.find((e) => e.id === selectedEventId);
  const currentTier = currentEvent?.ticketTiers.find((t) => t.id === selectedTierId);
  const unitPrice = currentTier ? currentTier.price : 0;
  const totalPrice = unitPrice * quantity;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!selectedEventId) {
      nextErrors.eventId = "Please select an event.";
    }

    if (!selectedTierId) {
      nextErrors.tierId = "Please select a ticket tier.";
    }

    if (quantity < 1 || quantity > 10) {
      nextErrors.quantity = "Quantity must be between 1 and 10 tickets.";
    }

    if (currentTier && currentTier.remaining < quantity) {
      nextErrors.quantity = `Only ${currentTier.remaining} ticket(s) remaining for this tier.`;
    }

    const trimmedName = attendeeName.trim();
    if (!trimmedName) {
      nextErrors.attendeeName = "Attendee full name is required.";
    } else if (trimmedName.length < 2) {
      nextErrors.attendeeName = "Name must be at least 2 characters.";
    }

    const trimmedEmail = attendeeEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      nextErrors.attendeeEmail = "Email address is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.attendeeEmail = "Please enter a valid email address.";
    }

    if (currentTier?.isMemberOnly && !memberStudentId.trim()) {
      nextErrors.memberStudentId =
        "Student ID is required to verify member discounted pricing.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleTierSelect = (tierId: string) => {
    setSelectedTierId(tierId);
    if (errors.tierId) setErrors((prev) => ({ ...prev, tierId: undefined }));
    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > 10) return 10;
      return next;
    });
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const payload = {
      eventId: selectedEventId,
      tierId: selectedTierId,
      quantity,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim().toLowerCase(),
      memberStudentId: memberStudentId.trim() || undefined,
    };

    let isSuccess = false;

    try {
      const response = await fetch("/api/events/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        if (data.isPaymentRequired) {
          // Ticket requires payment verification!
          setPendingBookingRef(data.bookingReference);
          setPendingTotalAmount(data.totalAmount);
          setStatus("payment_pending");
          setShowCheckoutModal(true);
        } else if (data.booking) {
          // Free ticket confirmed
          isSuccess = true;
          setConfirmedBooking(data.booking);
          setStatus("success");
          if (onSuccess) onSuccess(data.booking);
        }
      } else {
        setStatus("error");
        setErrorMessage(
          data?.message || `Booking failed with HTTP status ${response.status}.`
        );
      }
    } catch (err: unknown) {
      setStatus("error");
      const errText =
        err instanceof Error ? err.message : "Unable to reach the booking server.";
      setErrorMessage(errText);
    } finally {
      setStatus((prev) => (prev === "submitting" ? (isSuccess ? "success" : "error") : prev));
    }
  };

  const handlePaymentSuccess = (verifyResult: unknown) => {
    setShowCheckoutModal(false);
    const result = verifyResult as { booking?: BookingSuccessData };
    if (result?.booking) {
      setConfirmedBooking(result.booking);
      setStatus("success");
      if (onSuccess) onSuccess(result.booking);
    }
  };

  const handleCheckoutClose = () => {
    setShowCheckoutModal(false);
    // Modal remains in payment_pending state so user can retry payment without creating duplicate bookings
  };

  const handleReset = () => {
    setQuantity(1);
    setAttendeeName("");
    setAttendeeEmail("");
    setMemberStudentId("");
    setErrors({});
    setStatus("idle");
    setErrorMessage(null);
    setConfirmedBooking(null);
    setPendingBookingRef(null);
    setPendingTotalAmount(0);
    setShowCheckoutModal(false);
  };

  const handleClose = () => {
    if (status === "submitting") return;
    setStatus("idle");
    setErrorMessage(null);
    setErrors({});
    setPendingBookingRef(null);
    setPendingTotalAmount(0);
    setShowCheckoutModal(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Event Ticket Reservation"
      description="Select your ticket tier, specify attendee details, and reserve your official event pass."
      maxWidth="lg"
    >
      {/* SUCCESS CONFIRMATION STATE */}
      {status === "success" && confirmedBooking && (
        <div className="py-2 space-y-5">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">
                Reservation Confirmed!
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your tickets are registered in the association database. Digital passes are ready for gate entry.
              </p>
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                  Event
                </span>
                <span className="text-sm font-bold text-white">
                  {confirmedBooking.eventTitle}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
                  Booking Ref
                </span>
                <span className="font-mono font-bold text-indigo-400 text-sm">
                  {confirmedBooking.bookingReference}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block">Tier & Rate:</span>
                <span className="font-medium text-slate-200">
                  {confirmedBooking.tierName} (₹{confirmedBooking.unitPrice.toFixed(2)})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Quantity:</span>
                <span className="font-medium text-slate-200">
                  {confirmedBooking.quantity} ticket(s)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Primary Attendee:</span>
                <span className="font-medium text-slate-200">{confirmedBooking.guestName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ₹{confirmedBooking.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Issued Passes */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Digital Pass QR Codes ({confirmedBooking.tickets.length})
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {confirmedBooking.tickets.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="font-semibold text-white text-xs">{t.attendeeName}</div>
                        <div className="font-mono text-[11px] text-indigo-300">
                          {t.ticketCode}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success">Valid for Entry</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Book More Tickets
            </Button>
            <Button variant="gradient" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/* PAYMENT PENDING STATE */}
      {status === "payment_pending" && pendingBookingRef && (
        <div className="py-2 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Payment Pending — Tickets Not Yet Activated
              </h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Your reservation reference is saved, but tickets will <strong>NOT</strong> be issued and digital QR entry passes will <strong>NOT</strong> be active until payment is completed. No revenue has been recorded.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-blue-100 space-y-2.5 text-xs shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Booking Reference</span>
              <span className="font-mono font-bold text-blue-700 text-sm">{pendingBookingRef}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Payment Status</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                PENDING PAYMENT
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Event</span>
              <span className="font-semibold text-slate-800">{currentEvent?.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Amount Due</span>
              <span className="font-bold text-slate-900 text-sm">₹{pendingTotalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-600 text-center sm:text-left">
              Complete payment now to verify and generate your official gate-entry passes.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                Start Over
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                onClick={() => setShowCheckoutModal(true)}
              >
                Pay Now (₹{pendingTotalAmount.toFixed(2)}) →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING FORM STATE */}
      {status !== "success" && status !== "payment_pending" && (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
          {/* Error Banner */}
          {status === "error" && errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs space-y-1"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="font-semibold text-rose-300">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Event Selector (if multiple events exist) */}
          {events.length > 1 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  const ev = events.find((x) => x.id === e.target.value);
                  if (ev?.ticketTiers?.length) {
                    setSelectedTierId(ev.ticketTiers[0].id);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                    {ev.title} ({ev.remainingCapacity} seats left)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Event Details Card */}
          {currentEvent && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{currentEvent.title}</h4>
                <Badge variant="primary">
                  {currentEvent.remainingCapacity} / {currentEvent.totalCapacity} Seats Left
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {currentEvent.venue}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {new Date(currentEvent.startTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {new Date(currentEvent.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Ticket Tier Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
              Select Ticket Tier *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentEvent?.ticketTiers.map((tier) => {
                const isSelected = tier.id === selectedTierId;
                const isSoldOut = tier.remaining <= 0;

                return (
                  <div
                    key={tier.id}
                    onClick={() => !isSoldOut && handleTierSelect(tier.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSoldOut
                        ? "opacity-40 cursor-not-allowed bg-slate-950/40 border-slate-800"
                        : isSelected
                        ? "bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                        {tier.tierName}
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        ${tier.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>
                        {tier.isMemberOnly ? (
                          <span className="text-indigo-300 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 inline" /> Member Verified
                          </span>
                        ) : (
                          "Open to All"
                        )}
                      </span>
                      <span className={tier.remaining < 15 ? "text-amber-400" : ""}>
                        {isSoldOut ? "Sold Out" : `${tier.remaining} remaining`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.tierId && (
              <span className="text-xs text-rose-400 font-medium mt-1 block">
                {errors.tierId}
              </span>
            )}
          </div>

          {/* Member ID Input (Only shown if member-only tier is selected) */}
          {currentTier?.isMemberOnly && (
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
              <Input
                id="booking-member-studentid"
                label="Registered Student ID (Member Verification) *"
                placeholder="e.g. 1NT23CS042"
                value={memberStudentId}
                onChange={(e) => {
                  setMemberStudentId(e.target.value);
                  if (errors.memberStudentId) {
                    setErrors((prev) => ({ ...prev, memberStudentId: undefined }));
                  }
                }}
                error={errors.memberStudentId}
                helperText="Must match an active membership profile to claim $10 rate."
                disabled={status === "submitting"}
                required
              />
            </div>
          )}

          {/* Quantity Selector & Price Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Number of Tickets
              </span>
              <span className="text-xs text-slate-400">Max 10 tickets per order</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || status === "submitting"}
                  className="p-2 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-bold text-white min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={
                    quantity >= 10 ||
                    (currentTier ? quantity >= currentTier.remaining : false) ||
                    status === "submitting"
                  }
                  className="p-2 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right pl-3 border-l border-slate-800">
                <span className="text-[11px] text-slate-400 block uppercase">Total</span>
                <span className="text-base font-extrabold text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          {errors.quantity && (
            <span className="text-xs text-rose-400 font-medium block">{errors.quantity}</span>
          )}

          {/* Attendee Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                id="booking-name"
                label="Primary Attendee Name *"
                placeholder="e.g. Alex Rivera"
                value={attendeeName}
                onChange={(e) => {
                  setAttendeeName(e.target.value);
                  if (errors.attendeeName) {
                    setErrors((prev) => ({ ...prev, attendeeName: undefined }));
                  }
                }}
                error={errors.attendeeName}
                disabled={status === "submitting"}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <Input
                id="booking-email"
                type="email"
                label="Booking Email Address *"
                placeholder="e.g. alex@university.edu"
                value={attendeeEmail}
                onChange={(e) => {
                  setAttendeeEmail(e.target.value);
                  if (errors.attendeeEmail) {
                    setErrors((prev) => ({ ...prev, attendeeEmail: undefined }));
                  }
                }}
                error={errors.attendeeEmail}
                disabled={status === "submitting"}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={status === "submitting"}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="gradient"
              size="md"
              isLoading={status === "submitting"}
              className="gap-2 cursor-pointer"
            >
              {totalPrice === 0
                ? "Confirm Free Reservation"
                : `Proceed to Payment (₹${totalPrice.toFixed(2)})`}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Razorpay Gateway Modal Integration */}
      {showCheckoutModal && pendingBookingRef && (
        <RazorpayCheckoutModal
          isOpen={showCheckoutModal}
          onClose={handleCheckoutClose}
          title={`Ticket Pass: ${currentEvent?.title || "Event Reservation"}`}
          amount={pendingTotalAmount}
          purpose="EVENT_TICKET"
          referenceId={pendingBookingRef}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Modal>
  );
};
