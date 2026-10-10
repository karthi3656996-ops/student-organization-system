import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticketCode = body.ticketCode || body.qrCode;

    if (!ticketCode) {
      return NextResponse.json({ error: 'ticketCode is required' }, { status: 400 });
    }

    // Using transaction to prevent race conditions during check-in
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticketInstance.findUnique({
        where: { ticketCode },
        include: {
          booking: {
            include: { event: true }
          },
          tier: true
        }
      });

      if (!ticket) {
        throw new Error('NOT_FOUND');
      }

      if (ticket.isCheckedIn) {
        throw new Error('ALREADY_CHECKED_IN');
      }

      const updatedTicket = await tx.ticketInstance.update({
        where: { id: ticket.id },
        data: {
          isCheckedIn: true,
          checkedInAt: new Date(),
        }
      });

      return { ticket: updatedTicket, eventTitle: ticket.booking.event.title };
    });

    return NextResponse.json({ 
      message: 'Check-in successful', 
      ticketId: result.ticket.id,
      attendeeName: result.ticket.attendeeName,
      event: result.eventTitle
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      if (error.message === 'ALREADY_CHECKED_IN') return NextResponse.json({ error: 'Ticket is already checked in' }, { status: 409 });
    }
    
    console.error('Failed to check in ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
