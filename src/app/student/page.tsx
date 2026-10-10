import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentPortal from "@/components/student/student-portal";


export default async function StudentPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getSessionFromCookie();
  if (!session) redirect("/student/login");

  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedParams?.tab || "dashboard";

  // Fetch full student data
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      memberProfile: {
        select: {
          id: true, studentId: true, department: true, graduationYear: true,
          phoneNumber: true, status: true, validFrom: true, validUntil: true,
          memberQrToken: true,
          payments: {
            select: { id: true, academicYear: true, amount: true, paymentMethod: true, status: true, paidAt: true },
            orderBy: { paidAt: "desc" },
            take: 5,
          },
        },
      },
      ticketBookings: {
        select: {
          id: true, bookingReference: true, totalAmount: true, paymentStatus: true, createdAt: true,
          event: { select: { title: true, venue: true, startTime: true } },
          tickets: { select: { ticketCode: true, attendeeName: true, isCheckedIn: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      merchOrders: {
        select: {
          id: true, orderNumber: true, totalAmount: true, paymentStatus: true,
          fulfillmentStatus: true, pickupCode: true, createdAt: true,
          items: {
            select: {
              quantity: true, unitPrice: true,
              variant: { select: { size: true, color: true, merchItem: { select: { name: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/student/login");

  // Get upcoming events
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", startTime: { gte: new Date() } },
    include: {
      ticketTiers: true,
      bookings: { include: { tickets: true } },
    },
    orderBy: { startTime: "asc" },
    take: 6,
  });

  const formattedEvents = events.map((ev) => {
    const booked = ev.bookings.reduce((s, b) => s + (b.paymentStatus !== "CANCELLED" ? b.tickets.length : 0), 0);
    return {
      id: ev.id, title: ev.title, slug: ev.slug, venue: ev.venue,
      startTime: ev.startTime.toISOString(), endTime: ev.endTime.toISOString(),
      totalCapacity: ev.totalCapacity, bookedTickets: booked,
      remainingCapacity: Math.max(0, ev.totalCapacity - booked),
      ticketTiers: ev.ticketTiers.map((t) => ({
        id: t.id, tierName: t.tierName, price: Number(t.price),
        isMemberOnly: t.isMemberOnly, capacityLimit: t.capacityLimit,
      })),
    };
  });

  const memberData = user.memberProfile ? {
    id: user.memberProfile.id,
    studentId: user.memberProfile.studentId,
    department: user.memberProfile.department,
    graduationYear: user.memberProfile.graduationYear,
    phoneNumber: user.memberProfile.phoneNumber,
    status: user.memberProfile.status,
    validFrom: user.memberProfile.validFrom?.toISOString() ?? null,
    validUntil: user.memberProfile.validUntil?.toISOString() ?? null,
    memberQrToken: user.memberProfile.memberQrToken,
    payments: user.memberProfile.payments.map((p) => ({
      ...p, amount: Number(p.amount), paidAt: p.paidAt.toISOString(),
    })),
  } : null;

  return (
    <StudentPortal
      user={{
        id: user.id, name: user.name, email: user.email,
        role: user.role, createdAt: user.createdAt.toISOString(),
      }}
      member={memberData}
      bookings={user.ticketBookings.map((b) => ({
        ...b, totalAmount: Number(b.totalAmount),
        createdAt: b.createdAt.toISOString(),
        event: { ...b.event, startTime: b.event.startTime.toISOString() },
      }))}
      orders={user.merchOrders.map((o) => ({
        ...o, totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
      }))}
      upcomingEvents={formattedEvents}
      initialTab={initialTab}
    />
  );
}

