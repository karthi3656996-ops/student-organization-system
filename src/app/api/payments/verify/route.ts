import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request payload" },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      purpose = "MEMBERSHIP",
      amount,
      memberId,
      studentId,
      bookingReference,
      orderId,
    } = body;

    // Verify signature
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature verification failed." },
        { status: 400 }
      );
    }

    const paymentRef = razorpay_payment_id;
    const numAmount = Number(amount) || 499;

    // Handle by purpose
    if (purpose === "MEMBERSHIP") {
      let targetMember = null;
      if (memberId) {
        targetMember = await prisma.member.findUnique({ where: { id: memberId } });
      } else if (studentId) {
        targetMember = await prisma.member.findUnique({ where: { studentId } });
      }

      if (!targetMember) {
        return NextResponse.json(
          { success: false, message: "Member record not found for membership activation." },
          { status: 404 }
        );
      }

      const txnNumber = `TXN-MEM-${Date.now().toString(36).toUpperCase()}`;

      const result = await prisma.$transaction(async (tx) => {
        const financialTxn = await tx.financialTransaction.create({
          data: {
            transactionNumber: txnNumber,
            type: "INCOME",
            sourceModule: "MEMBERSHIP_DUES",
            amount: numAmount,
            description: `Annual membership payment via Razorpay (${paymentRef})`,
            referenceId: targetMember.id,
            semesterPeriod: "SPRING_2026",
          },
        });

        const payment = await tx.membershipPayment.create({
          data: {
            memberId: targetMember.id,
            academicYear: "2025-2026",
            amount: numAmount,
            paymentMethod: "RAZORPAY",
            paymentReference: paymentRef,
            status: "PAID",
            financialTxnId: financialTxn.id,
          },
        });

        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const updatedMember = await tx.member.update({
          where: { id: targetMember.id },
          data: {
            status: "ACTIVE",
            validUntil: oneYearFromNow,
          },
        });

        return { payment, updatedMember, financialTxn };
      });

      return NextResponse.json({
        success: true,
        message: "Membership activated and payment verified successfully.",
        paymentId: paymentRef,
        member: result.updatedMember,
      });
    }

    if (purpose === "EVENT_TICKET") {
      if (!bookingReference) {
        return NextResponse.json(
          { success: false, message: "Booking reference is required." },
          { status: 400 }
        );
      }

      const booking = await prisma.ticketBooking.findUnique({
        where: { bookingReference },
        include: {
          event: true,
          tickets: { include: { tier: true } },
        },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, message: "Booking reference not found." },
          { status: 404 }
        );
      }

      // Idempotency: If already paid, return confirmed booking without duplicating revenue or tickets
      if (booking.paymentStatus === "PAID" || booking.paymentStatus === "CONFIRMED") {
        return NextResponse.json({
          success: true,
          message: "Payment already verified and tickets confirmed.",
          alreadyProcessed: true,
          bookingReference,
          booking: {
            id: booking.id,
            bookingReference: booking.bookingReference,
            eventTitle: booking.event.title,
            venue: booking.event.venue,
            startTime: booking.event.startTime,
            totalAmount: Number(booking.totalAmount),
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            paymentStatus: booking.paymentStatus,
            tickets: booking.tickets.map((t) => ({
              ticketCode: t.ticketCode,
              attendeeName: t.attendeeName,
            })),
          },
        });
      }

      if (booking.paymentStatus !== "PENDING_PAYMENT") {
        return NextResponse.json(
          { success: false, message: `Booking cannot be verified. Status is ${booking.paymentStatus}.` },
          { status: 400 }
        );
      }

      // Authoritative database amount check
      const requiredAmount = Number(booking.totalAmount);
      const txnNumber = `TXN-EVT-${Date.now().toString(36).toUpperCase()}`;

      const verifiedResult = await prisma.$transaction(async (tx) => {
        // Record Financial Transaction (INCOME) in the double-entry treasury ledger
        const financialTxn = await tx.financialTransaction.create({
          data: {
            transactionNumber: txnNumber,
            type: "INCOME",
            sourceModule: "EVENT_TICKETS",
            amount: requiredAmount,
            description: `Ticket booking for ${booking.event.title} (${bookingReference}) via Razorpay (${paymentRef})`,
            referenceId: booking.id,
            semesterPeriod: "SPRING_2026",
          },
        });

        // Update booking status to PAID
        const updatedBooking = await tx.ticketBooking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: "PAID",
            financialTxnId: financialTxn.id,
          },
        });

        // Activate ticket instances by replacing placeholder with active pass code
        const activatedTickets = [];
        for (const t of booking.tickets) {
          const passSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
          const activeTicketCode = `PASS-2026-GALA-${passSuffix}`;
          const updatedTicket = await tx.ticketInstance.update({
            where: { id: t.id },
            data: { ticketCode: activeTicketCode },
          });
          activatedTickets.push(updatedTicket);
        }

        return { updatedBooking, financialTxn, activatedTickets };
      });

      return NextResponse.json({
        success: true,
        message: "Event ticket payment verified and digital passes issued.",
        bookingReference,
        paymentId: paymentRef,
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          eventTitle: booking.event.title,
          venue: booking.event.venue,
          startTime: booking.event.startTime,
          totalAmount: requiredAmount,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          paymentStatus: "PAID",
          tickets: verifiedResult.activatedTickets.map((t) => ({
            ticketCode: t.ticketCode,
            attendeeName: t.attendeeName,
          })),
        },
      });
    }

    if (purpose === "MERCHANDISE" && orderId) {
      const existingOrder = await prisma.merchOrder.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderNumber: orderId },
          ],
        },
      });

      const txnNumber = `TXN-MRC-${Date.now().toString(36).toUpperCase()}`;

      await prisma.$transaction(async (tx) => {
        const financialTxn = await tx.financialTransaction.create({
          data: {
            transactionNumber: txnNumber,
            type: "INCOME",
            sourceModule: "MERCHANDISE",
            amount: numAmount,
            description: `Merchandise order payment via Razorpay (${paymentRef})`,
            referenceId: existingOrder?.orderNumber || orderId,
            semesterPeriod: "SPRING_2026",
          },
        });

        if (existingOrder) {
          await tx.merchOrder.update({
            where: { id: existingOrder.id },
            data: {
              paymentStatus: "PAID",
              fulfillmentStatus: "PENDING",
              financialTxnId: financialTxn.id,
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: "Merchandise order payment verified.",
        orderId: existingOrder?.id || orderId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment signature verified.",
      paymentId: paymentRef,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment." },
      { status: 500 }
    );
  }
}
