import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request payload. Expected JSON body." },
        { status: 400 }
      );
    }

    const {
      eventId,
      tierId,
      quantity,
      attendeeName,
      attendeeEmail,
      memberStudentId,
    } = body;

    // 1. Basic Field Validation
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid event ID is required." },
        { status: 400 }
      );
    }

    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid ticket tier is required." },
        { status: 400 }
      );
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 10) {
      return NextResponse.json(
        { success: false, message: "Ticket quantity must be an integer between 1 and 10." },
        { status: 400 }
      );
    }

    if (!attendeeName || typeof attendeeName !== "string" || attendeeName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Attendee name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!attendeeEmail || typeof attendeeEmail !== "string" || !emailRegex.test(attendeeEmail.trim())) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanAttendeeName = attendeeName.trim();
    const cleanAttendeeEmail = attendeeEmail.trim().toLowerCase();
    const cleanStudentId = typeof memberStudentId === "string" ? memberStudentId.trim() : "";

    // 2. Fetch Event & Tier
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTiers: true,
        bookings: {
          include: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, message: "This event is currently not open for public booking." },
        { status: 400 }
      );
    }

    const selectedTier = event.ticketTiers.find((t) => t.id === tierId);
    if (!selectedTier) {
      return NextResponse.json(
        { success: false, message: "The selected ticket tier does not belong to this event." },
        { status: 400 }
      );
    }

    // 3. Member Validation for Member-Only Tiers
    let verifiedUserId: string | null = null;

    if (selectedTier.isMemberOnly) {
      let isVerifiedMember = false;

      // Check by student ID if provided
      if (cleanStudentId) {
        const memberByStudentId = await prisma.member.findUnique({
          where: { studentId: cleanStudentId },
          include: { user: true },
        });
        if (memberByStudentId && memberByStudentId.status === "ACTIVE") {
          isVerifiedMember = true;
          verifiedUserId = memberByStudentId.userId;
        }
      }

      // Check by email if not yet verified
      if (!isVerifiedMember) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: cleanAttendeeEmail },
          include: { memberProfile: true },
        });
        if (userByEmail?.memberProfile && userByEmail.memberProfile.status === "ACTIVE") {
          isVerifiedMember = true;
          verifiedUserId = userByEmail.id;
        }
      }

      if (!isVerifiedMember) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The 'Member Discount Pass' is restricted to active Skyline members. Please enter your registered Student ID or select 'General Public / Guest'.",
          },
          { status: 403 }
        );
      }
    } else {
      // Find user by email for non-member tier if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanAttendeeEmail },
      });
      if (existingUser) {
        verifiedUserId = existingUser.id;
      }
    }

    // 4. Capacity Checks
    const totalBookedTickets = event.bookings.reduce(
      (sum, booking) => sum + booking.tickets.length,
      0
    );
    const remainingOverall = event.totalCapacity - totalBookedTickets;

    if (parsedQty > remainingOverall) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot book ${parsedQty} tickets. Only ${remainingOverall} seat(s) remaining for this event.`,
        },
        { status: 409 }
      );
    }

    if (selectedTier.capacityLimit) {
      const tierBooked = event.bookings.reduce(
        (sum, booking) =>
          sum + booking.tickets.filter((t) => t.tierId === selectedTier.id).length,
        0
      );
      const remainingTier = selectedTier.capacityLimit - tierBooked;
      if (parsedQty > remainingTier) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${remainingTier} ticket(s) remaining for tier '${selectedTier.tierName}'.`,
          },
          { status: 409 }
        );
      }
    }

    // 5. Calculate Total Amount & Pricing
    const unitPrice = Number(selectedTier.price);
    const totalAmount = unitPrice * parsedQty;
    const bookingReference = `BK-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 6. Execute Atomic Booking in Prisma Transaction
    const bookingResult = await prisma.$transaction(async (tx) => {
      // Record Financial Transaction (Double-entry treasury ledger)
      const txn = await tx.financialTransaction.create({
        data: {
          transactionNumber: `TXN-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          type: "INCOME",
          sourceModule: "EVENT_TICKETS",
          amount: totalAmount,
          referenceId: bookingReference,
          semesterPeriod: "SPRING_2026",
          description: `Gala Ticket Booking ${bookingReference} (${parsedQty}x ${selectedTier.tierName})`,
        },
      });

      // Create Ticket Booking
      const booking = await tx.ticketBooking.create({
        data: {
          bookingReference,
          eventId: event.id,
          userId: verifiedUserId,
          guestName: cleanAttendeeName,
          guestEmail: cleanAttendeeEmail,
          totalAmount,
          paymentStatus: "CONFIRMED",
          financialTxnId: txn.id,
        },
      });

      // Create Individual Ticket Instances
      const ticketsData = Array.from({ length: parsedQty }).map((_, index) => {
        const passSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const ticketCode = `PASS-2026-GALA-${passSuffix}`;
        const individualAttendee =
          parsedQty === 1
            ? cleanAttendeeName
            : `${cleanAttendeeName} (Guest ${index + 1})`;

        return {
          bookingId: booking.id,
          tierId: selectedTier.id,
          ticketCode,
          attendeeName: individualAttendee,
          isCheckedIn: false,
        };
      });

      await tx.ticketInstance.createMany({
        data: ticketsData,
      });

      // Retrieve full created booking with tickets
      const fullBooking = await tx.ticketBooking.findUnique({
        where: { id: booking.id },
        include: {
          tickets: true,
          event: {
            select: {
              title: true,
              venue: true,
              startTime: true,
            },
          },
        },
      });

      return fullBooking;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tickets successfully booked!",
        booking: {
          id: bookingResult?.id,
          bookingReference: bookingResult?.bookingReference,
          eventTitle: bookingResult?.event.title,
          venue: bookingResult?.event.venue,
          startTime: bookingResult?.event.startTime,
          tierName: selectedTier.tierName,
          unitPrice,
          quantity: parsedQty,
          totalAmount,
          guestName: cleanAttendeeName,
          guestEmail: cleanAttendeeEmail,
          tickets: bookingResult?.tickets.map((t) => ({
            ticketCode: t.ticketCode,
            attendeeName: t.attendeeName,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/events/book error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Booking failed: ${errMessage}`,
      },
      { status: 500 }
    );
  }
}
