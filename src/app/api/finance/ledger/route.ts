import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const typeParam = searchParams.get("type"); // "INCOME" | "EXPENSE"
    const sourceParam = searchParams.get("source");

    const take = limitParam
      ? Math.min(200, Math.max(1, parseInt(limitParam, 10)))
      : 100;

    const whereClause: Record<string, unknown> = {};
    if (typeParam && ["INCOME", "EXPENSE"].includes(typeParam)) {
      whereClause.type = typeParam;
    }
    if (
      sourceParam &&
      [
        "MEMBERSHIP_DUES",
        "EVENT_TICKETS",
        "MERCHANDISE",
        "FUNDRAISER",
        "REIMBURSEMENT",
        "DIRECT_EXPENSE",
      ].includes(sourceParam)
    ) {
      whereClause.sourceModule = sourceParam;
    }

    const [transactions, incomeSum, expenseSum] = await Promise.all([
      prisma.financialTransaction.findMany({
        where: whereClause,
        orderBy: { recordedAt: "desc" },
        take,
      }),
      prisma.financialTransaction.aggregate({
        where: { type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeSum._sum.amount ?? 0);
    const totalExpense = Number(expenseSum._sum.amount ?? 0);
    const availableBalance = totalIncome - totalExpense;

    const formatted = transactions.map((t) => ({
      id: t.id,
      transactionNumber: t.transactionNumber,
      type: t.type,
      sourceModule: t.sourceModule,
      amount: Number(t.amount),
      referenceId: t.referenceId,
      semesterPeriod: t.semesterPeriod,
      description: t.description,
      recordedAt: t.recordedAt,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        availableBalance,
        transactionCount: formatted.length,
      },
      transactions: formatted,
    });
  } catch (error) {
    console.error("GET /api/finance/ledger error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { type, sourceModule, amount, description, referenceId, semesterPeriod } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number." },
        { status: 400 }
      );
    }

    if (!type || !["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "type must be either INCOME or EXPENSE." },
        { status: 400 }
      );
    }

    const validSources = [
      "MEMBERSHIP_DUES",
      "EVENT_TICKETS",
      "MERCHANDISE",
      "FUNDRAISER",
      "REIMBURSEMENT",
      "DIRECT_EXPENSE",
    ];

    let resolvedSource = sourceModule;
    if (!validSources.includes(resolvedSource)) {
      resolvedSource = type === "EXPENSE" ? "DIRECT_EXPENSE" : "FUNDRAISER";
    }

    const cleanDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : `${type} transaction`;

    const cleanRef =
      typeof referenceId === "string" && referenceId.trim()
        ? referenceId.trim()
        : `TXN-REF-${Date.now().toString(36).toUpperCase()}`;

    const cleanSemester =
      typeof semesterPeriod === "string" && semesterPeriod.trim()
        ? semesterPeriod.trim()
        : `SPRING_${new Date().getFullYear()}`;

    const txnNumber = `TXN-${new Date().getFullYear()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const transaction = await prisma.financialTransaction.create({
      data: {
        transactionNumber: txnNumber,
        type,
        sourceModule: resolvedSource,
        amount: numAmount,
        referenceId: cleanRef,
        semesterPeriod: cleanSemester,
        description: cleanDescription,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Financial transaction recorded successfully.",
        transaction: {
          id: transaction.id,
          transactionNumber: transaction.transactionNumber,
          type: transaction.type,
          sourceModule: transaction.sourceModule,
          amount: Number(transaction.amount),
          referenceId: transaction.referenceId,
          semesterPeriod: transaction.semesterPeriod,
          description: transaction.description,
          recordedAt: transaction.recordedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/finance/ledger error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


