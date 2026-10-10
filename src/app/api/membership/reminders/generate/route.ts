import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Find all members with expiration dates within the next 30 days or already past
    const candidates = await prisma.member.findMany({
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
        reminders: {
          where: {
            sentAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    let generatedCount = 0;
    let skippedCount = 0;
    const createdReminders = [];

    for (const member of candidates) {
      const validUntil = member.validUntil as Date;
      let reminderType: "30_DAYS_BEFORE" | "7_DAYS_BEFORE" | "LAPSED";

      if (validUntil < now) {
        reminderType = "LAPSED";
      } else if (validUntil <= in7Days) {
        reminderType = "7_DAYS_BEFORE";
      } else {
        reminderType = "30_DAYS_BEFORE";
      }

      // Check for duplicate reminder of the same type within the past 30 days
      const alreadySent = member.reminders.some((r) => r.reminderType === reminderType);
      if (alreadySent) {
        skippedCount++;
        continue;
      }

      // Transparent delivery recording:
      // When no external transactional SMTP service is configured, record status as LOGGED_IN_SYSTEM.
      const reminder = await prisma.membershipReminder.create({
        data: {
          memberId: member.id,
          reminderType,
          status: "LOGGED_IN_SYSTEM",
          sentAt: now,
        },
      });

      // If membership has lapsed, update membership status to EXPIRED
      if (reminderType === "LAPSED" && member.status === "ACTIVE") {
        await prisma.member.update({
          where: { id: member.id },
          data: { status: "EXPIRED" },
        });
      }

      createdReminders.push({
        id: reminder.id,
        memberId: member.id,
        studentId: member.studentId,
        memberName: member.user.name,
        memberEmail: member.user.email,
        reminderType,
        deliveryMethod: "SYSTEM_LEDGER_AUDIT",
        status: reminder.status,
      });

      generatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedCount} reminder(s). ${skippedCount} candidate(s) already had reminders logged within the last 30 days.`,
      stats: {
        totalEvaluated: candidates.length,
        generatedCount,
        skippedCount,
        deliveryProviderStatus: "NO_EXTERNAL_SMTP_CONFIGURED (Honest system-logged audit records)",
      },
      createdReminders,
    });
  } catch (error) {
    console.error("POST /api/membership/reminders/generate error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
