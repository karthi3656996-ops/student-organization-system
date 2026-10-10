import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    // Query filter: support explicit status query, or default to published events for public views
    const query: Record<string, string> = {};
    if (statusParam) {
      if (['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(statusParam)) {
        query.status = statusParam;
      }
    } else {
      query.status = 'PUBLISHED';
    }

    const events = await prisma.event.findMany({
      where: query,
      include: {
        ticketTiers: true,
        bookings: {
          include: {
            tickets: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const formattedEvents = events.map((event) => {
      // Calculate total confirmed tickets booked (PAID or CONFIRMED)
      const confirmedBookedTickets = event.bookings.reduce(
        (sum, booking) =>
          sum + (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'CONFIRMED' ? booking.tickets.length : 0),
        0
      );

      const pendingTickets = event.bookings.reduce(
        (sum, booking) =>
          sum + (booking.paymentStatus === 'PENDING_PAYMENT' ? booking.tickets.length : 0),
        0
      );

      const remainingCapacity = Math.max(0, event.totalCapacity - confirmedBookedTickets);

      // Calculate per-tier remaining
      const tiersWithAvailability = event.ticketTiers.map((tier) => {
        const tierBooked = event.bookings.reduce(
          (sum, booking) =>
            sum +
            (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'CONFIRMED'
              ? booking.tickets.filter((t) => t.tierId === tier.id).length
              : 0),
          0
        );

        const tierRemaining = tier.capacityLimit !== null && tier.capacityLimit !== undefined
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
        imageUrl: event.imageUrl || "/images/events/default-event.svg",
        status: event.status,
        bookedTickets: confirmedBookedTickets,
        pendingTickets,
        remainingCapacity,
        ticketTiers: tiersWithAvailability,
        bookings: event.bookings.map((b) => ({
          id: b.id,
          bookingReference: b.bookingReference,
          guestName: b.guestName,
          guestEmail: b.guestEmail,
          paymentStatus: b.paymentStatus,
          totalAmount: Number(b.totalAmount),
          ticketCount: b.tickets.length,
          createdAt: b.createdAt,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      events: formattedEvents,
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, venue, startTime, endTime, totalCapacity, status, ticketTiers, imageUrl } = body;

    // Validation
    if (!title || !slug || !description || !venue || !startTime || !endTime || totalCapacity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate imageUrl if provided
    let cleanImageUrl: string | null = null;
    if (typeof imageUrl === "string" && imageUrl.trim()) {
      cleanImageUrl = imageUrl.trim();
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'startTime must be before endTime' }, { status: 400 });
    }

    if (totalCapacity <= 0) {
      return NextResponse.json({ error: 'totalCapacity must be greater than 0' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'An event with this slug already exists' }, { status: 409 });
    }

    // Ticket Tiers capacity validation
    const tiersData: { tierName: string; price: number; isMemberOnly: boolean; capacityLimit: number | null }[] = [];
    if (Array.isArray(ticketTiers) && ticketTiers.length > 0) {
      let tiersCapacitySum = 0;
      for (const tier of ticketTiers) {
        if (!tier.tierName || tier.price === undefined) {
          return NextResponse.json({ error: 'Ticket tier must have tierName and price' }, { status: 400 });
        }
        if (tier.capacityLimit !== undefined && tier.capacityLimit !== null) {
          tiersCapacitySum += tier.capacityLimit;
        }
        tiersData.push({
          tierName: tier.tierName,
          price: tier.price,
          isMemberOnly: tier.isMemberOnly || false,
          capacityLimit: tier.capacityLimit,
        });
      }

      if (tiersCapacitySum > totalCapacity) {
        return NextResponse.json({ error: 'Sum of ticket tier capacities exceeds event total capacity' }, { status: 400 });
      }
    }

    const eventStatus = (status && ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(status)) ? status : 'DRAFT';

    // Create Event in Prisma
    const newEvent = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        venue,
        startTime: start,
        endTime: end,
        totalCapacity,
        imageUrl: cleanImageUrl || "/images/events/default-event.svg",
        status: eventStatus,
        ticketTiers: {
          create: tiersData,
        },
      },
      include: {
        ticketTiers: true,
      }
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


