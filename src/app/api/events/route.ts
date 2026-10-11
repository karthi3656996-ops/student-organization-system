import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: Record<string, string> = {};
    if (status) {
      // Validate status against enum manually since it's a string from URL
      if (['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(status)) {
        query.status = status;
      }
    }

    const events = await prisma.event.findMany({
      where: query,
      include: {
        ticketTiers: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, venue, startTime, endTime, totalCapacity, status, ticketTiers } = body;

    // Validation
    if (!title || !slug || !description || !venue || !startTime || !endTime || totalCapacity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Create Event
    const newEvent = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        venue,
        startTime: start,
        endTime: end,
        totalCapacity,
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
