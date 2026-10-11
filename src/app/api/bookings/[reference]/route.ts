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

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
