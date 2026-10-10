import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required." },
        { status: 400 }
      );
    }

    const campaign = await prisma.fundraiserCampaign.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );
    }

    // Fetch all recorded financial transactions linked to this campaign
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        sourceModule: "FUNDRAISER",
        referenceId: campaign.id,
      },
      orderBy: { recordedAt: "desc" },
    });

    // Compute actual sums directly from recorded database transactions
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBalance = totalIncome - totalExpense;
    const targetAmount = Number(campaign.targetAmount);
    const progressPercent = Math.min(
      100,
      Math.round((totalIncome / Math.max(1, targetAmount)) * 100)
    );

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        targetAmount,
        currentAmount: Number(campaign.currentAmount),
        status: campaign.status,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
        tasksCount: campaign.tasks.length,
        completedTasksCount: campaign.tasks.filter((t) => t.status === "DONE").length,
        tasks: campaign.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          assignedTo: t.assignedTo,
        })),
      },
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        targetAmount,
        progressPercent,
        transactionCount: transactions.length,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        transactionNumber: t.transactionNumber,
        type: t.type,
        sourceModule: t.sourceModule,
        amount: Number(t.amount),
        description: t.description,
        referenceId: t.referenceId,
        semesterPeriod: t.semesterPeriod,
        recordedAt: t.recordedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/fundraising/[id]/ledger error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching campaign ledger" },
      { status: 500 }
    );
  }
}
