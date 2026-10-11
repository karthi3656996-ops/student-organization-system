import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const body = await request.json();
    const { userId, guestName, guestEmail, tickets } = body;

    if (!userId && (!guestName || !guestEmail)) {
      return NextResponse.json({ error: 'Must provide either userId or guestName and guestEmail' }, { status: 400 });
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: 'Must provide at least one ticket' }, { status: 400 });
    }

    for (const t of tickets) {
      if (!t.tierId || !t.attendeeName) {
        return NextResponse.json({ error: 'Each ticket must have a tierId and attendeeName' }, { status: 400 });
      }
    }

    // We use an interactive transaction to prevent overbooking race conditions
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Fetch Event and its Ticket Tiers
      const event = await tx.event.findUnique({
        where: { slug },
        include: { ticketTiers: true },
      });

      if (!event) {
        throw new Error('NOT_FOUND');
      }

      if (event.status !== 'PUBLISHED') {
        throw new Error('NOT_PUBLISHED');
      }

      // 2. Aggregate requested tickets by tier
      const tierCounts: Record<string, number> = {};
      tickets.forEach((t: { tierId: string, attendeeName: string }) => {
        tierCounts[t.tierId] = (tierCounts[t.tierId] || 0) + 1;
      });

      // 3. Verify Tiers, Member Status, and calculate total amount
      let totalAmount = 0;
      let isMemberVerified = false;
      let hasActiveMembership = false;

      for (const [tierId, count] of Object.entries(tierCounts)) {
        const tier = event.ticketTiers.find(t => t.id === tierId);
        if (!tier) {
          throw new Error(`INVALID_TIER_${tierId}`);
        }

        // Member check
        if (tier.isMemberOnly) {
          if (!userId) {
            throw new Error('MEMBER_ONLY_REQUIRES_LOGIN');
          }
          if (!isMemberVerified) {
            const member = await tx.member.findUnique({ where: { userId } });
            if (member && member.status === 'ACTIVE') {
              hasActiveMembership = true;
            }
            isMemberVerified = true;
          }
          if (!hasActiveMembership) {
            throw new Error('ACTIVE_MEMBERSHIP_REQUIRED');
          }
        }

        // Tier Capacity check
        if (tier.capacityLimit !== null) {
          const soldTierTickets = await tx.ticketInstance.count({
            where: { tierId: tier.id, booking: { paymentStatus: { not: 'CANCELLED' } } }
          });
          if (soldTierTickets + count > tier.capacityLimit) {
            throw new Error(`TIER_SOLD_OUT_${tier.tierName}`);
          }
        }

        totalAmount += (Number(tier.price) * count);
      }

      // 4. Verify Total Event Capacity
      const totalSoldTickets = await tx.ticketInstance.count({
        where: { booking: { eventId: event.id, paymentStatus: { not: 'CANCELLED' } } }
      });

      if (totalSoldTickets + tickets.length > event.totalCapacity) {
        throw new Error('EVENT_SOLD_OUT');
      }

      // 5. Generate Reference and Create Booking
      const bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newBooking = await tx.ticketBooking.create({
        data: {
          bookingReference,
          eventId: event.id,
          userId: userId || null,
          guestName: guestName || null,
          guestEmail: guestEmail || null,
          totalAmount,
          paymentStatus: 'PAID', // In a real app, this would be PENDING until payment webhook succeeds
          tickets: {
            create: tickets.map((t: { tierId: string, attendeeName: string }) => ({
              tierId: t.tierId,
              attendeeName: t.attendeeName,
              ticketCode: `TCK-${crypto.randomUUID()}`
            }))
          }
        },
        include: {
          tickets: true,
          event: {
            select: { title: true, startTime: true, venue: true }
          }
        }
      });

      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      if (error.message === 'NOT_PUBLISHED') return NextResponse.json({ error: 'Event is not open for booking' }, { status: 400 });
      if (error.message.startsWith('INVALID_TIER')) return NextResponse.json({ error: 'Invalid ticket tier requested' }, { status: 400 });
      if (error.message === 'MEMBER_ONLY_REQUIRES_LOGIN') return NextResponse.json({ error: 'A member-only ticket requires a logged-in user' }, { status: 401 });
      if (error.message === 'ACTIVE_MEMBERSHIP_REQUIRED') return NextResponse.json({ error: 'An active membership is required for member-only tickets' }, { status: 403 });
      if (error.message.startsWith('TIER_SOLD_OUT')) return NextResponse.json({ error: 'One of the requested ticket tiers is sold out' }, { status: 409 });
      if (error.message === 'EVENT_SOLD_OUT') return NextResponse.json({ error: 'The event is sold out' }, { status: 409 });
    }

    console.error('Failed to book tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
