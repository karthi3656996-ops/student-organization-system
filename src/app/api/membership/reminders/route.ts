import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId")?.trim();
    const type = searchParams.get("type")?.trim();

    const whereClause: Record<string, unknown> = {};
    if (memberId) whereClause.memberId = memberId;
    if (type) whereClause.reminderType = type;

    // 1. Fetch reminder history
    const reminders = await prisma.membershipReminder.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            id: true,
            studentId: true,
            status: true,
            validUntil: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    // 2. Identify currently expiring and lapsed members in the database
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const expiringMembers = await prisma.member.findMany({
      where: {
        validUntil: {
          not: null,
          lte: in30Days,
        },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const categoryBreakdown = {
      lapsedCount: 0,
      due7DaysCount: 0,
      due30DaysCount: 0,
    };

    const membersRequiringAttention = expiringMembers.map((m) => {
      const validUntil = m.validUntil as Date;
      let urgency: "LAPSED" | "7_DAYS_BEFORE" | "30_DAYS_BEFORE" = "30_DAYS_BEFORE";
      const daysRemaining = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (validUntil < now) {
        urgency = "LAPSED";
        categoryBreakdown.lapsedCount++;
      } else if (validUntil <= in7Days) {
        urgency = "7_DAYS_BEFORE";
        categoryBreakdown.due7DaysCount++;
      } else {
        urgency = "30_DAYS_BEFORE";
        categoryBreakdown.due30DaysCount++;
      }

      return {
        memberId: m.id,
        studentId: m.studentId,
        name: m.user.name,
        email: m.user.email,
        status: m.status,
        validUntil: m.validUntil,
        daysRemaining,
        urgency,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalLoggedReminders: reminders.length,
        pendingMembersAtRisk: expiringMembers.length,
        ...categoryBreakdown,
      },
      membersAtRisk: membersRequiringAttention,
      reminders: reminders.map((r) => ({
        id: r.id,
        memberId: r.memberId,
        studentId: r.member.studentId,
        memberName: r.member.user.name,
        memberEmail: r.member.user.email,
        reminderType: r.reminderType,
        status: r.status,
        sentAt: r.sentAt,
        validUntil: r.member.validUntil,
      })),
    });
  } catch (error) {
    console.error("GET /api/membership/reminders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

