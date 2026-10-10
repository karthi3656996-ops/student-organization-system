import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Run all counts in parallel for performance
    const [
      activeMembers,
      publishedEvents,
      pendingClaims,
      incomeAggregate,
      expenseAggregate,
    ] = await Promise.all([
      // Real active member count
      prisma.member.count({
        where: { status: "ACTIVE" },
      }),

      // Real published event count
      prisma.event.count({
        where: { status: "PUBLISHED" },
      }),

      // Real pending reimbursement claims
      prisma.reimbursementClaim.count({
        where: { status: "SUBMITTED" },
      }),

      // Real total income from financial ledger
      prisma.financialTransaction.aggregate({
        where: { type: "INCOME" },
        _sum: { amount: true },
      }),

      // Real total expenses from financial ledger
      prisma.financialTransaction.aggregate({
        where: { type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeAggregate._sum.amount ?? 0);
    const totalExpense = Number(expenseAggregate._sum.amount ?? 0);
    const availableBalance = totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      stats: {
        activeMembers,
        publishedEvents,
        pendingClaims,
        totalIncome,
        totalExpense,
        availableBalance,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


