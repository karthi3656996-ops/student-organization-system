import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const reference = (await params).reference;
    
    const booking = await prisma.ticketBooking.findUnique({
      where: { bookingReference: reference },
      include: {
        event: {
          select: {
            title: true,
            venue: true,
            startTime: true,
            endTime: true,
          }
        },
        tickets: {
          include: {
            tier: {
              select: { tierName: true }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isConfirmed = booking.paymentStatus === 'PAID' || booking.paymentStatus === 'CONFIRMED';

    return NextResponse.json({
      id: booking.id,
      bookingReference: booking.bookingReference,
      paymentStatus: booking.paymentStatus,
      totalAmount: Number(booking.totalAmount),
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      createdAt: booking.createdAt,
      event: booking.event,
      tickets: isConfirmed ? booking.tickets : [],
    });
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
