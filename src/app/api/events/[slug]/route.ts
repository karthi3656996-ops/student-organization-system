import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        ticketTiers: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const body = await request.json();
    
    // First check if it exists
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Only allow updating certain fields for simplicity
    const { title, description, venue, startTime, endTime, totalCapacity, status } = body;
    
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (venue) updateData.venue = venue;
    
    if (startTime) {
      const start = new Date(startTime);
      if (isNaN(start.getTime())) return NextResponse.json({ error: 'Invalid start date format' }, { status: 400 });
      updateData.startTime = start;
    }
    
    if (endTime) {
      const end = new Date(endTime);
      if (isNaN(end.getTime())) return NextResponse.json({ error: 'Invalid end date format' }, { status: 400 });
      updateData.endTime = end;
    }
    
    // If both are provided, validate them together, or validate against existing
    const finalStart = (updateData.startTime as Date) || existing.startTime;
    const finalEnd = (updateData.endTime as Date) || existing.endTime;
    if (finalStart >= finalEnd) {
      return NextResponse.json({ error: 'startTime must be before endTime' }, { status: 400 });
    }

    if (totalCapacity !== undefined) {
      if (totalCapacity <= 0) return NextResponse.json({ error: 'totalCapacity must be greater than 0' }, { status: 400 });
      updateData.totalCapacity = totalCapacity;
    }

    if (status) {
      if (['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(status)) {
        updateData.status = status;
      } else {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { slug },
      data: updateData,
      include: {
        ticketTiers: true,
      }
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const existing = await prisma.event.findUnique({ where: { slug } });
    
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const existingBookings = await prisma.ticketBooking.count({ where: { eventId: existing.id } });
    if (existingBookings > 0) {
      return NextResponse.json({ error: 'Cannot delete an event that has active bookings. Please cancel the event instead.' }, { status: 409 });
    }

    await prisma.event.delete({
      where: { slug }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
