import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        ticketTiers: true,
        bookings: {
          include: {
            tickets: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const formattedEvents = events.map((event) => {
      // Calculate total tickets booked across all bookings
      const totalBookedTickets = event.bookings.reduce(
        (sum, booking) => sum + booking.tickets.length,
        0
      );

      const remainingCapacity = Math.max(0, event.totalCapacity - totalBookedTickets);

      // Calculate per-tier remaining
      const tiersWithAvailability = event.ticketTiers.map((tier) => {
        const tierBooked = event.bookings.reduce(
          (sum, booking) =>
            sum + booking.tickets.filter((t) => t.tierId === tier.id).length,
          0
        );

        const tierRemaining = tier.capacityLimit
          ? Math.max(0, tier.capacityLimit - tierBooked)
          : remainingCapacity;

        return {
          id: tier.id,
          eventId: tier.eventId,
          tierName: tier.tierName,
          price: Number(tier.price),
          isMemberOnly: tier.isMemberOnly,
          capacityLimit: tier.capacityLimit,
          bookedTickets: tierBooked,
          remaining: Math.min(tierRemaining, remainingCapacity),
        };
      });

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        venue: event.venue,
        startTime: event.startTime,
        endTime: event.endTime,
        totalCapacity: event.totalCapacity,
        bookedTickets: totalBookedTickets,
        remainingCapacity,
        ticketTiers: tiersWithAvailability,
      };
    });

    return NextResponse.json({
      success: true,
      events: formattedEvents,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to load events: ${errMessage}`,
      },
      { status: 500 }
    );
  }
}
