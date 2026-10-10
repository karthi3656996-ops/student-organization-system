import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";

// PATCH /api/finance/claims/[id] — Approve or Reject a claim
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromCookie();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { action, reviewNotes } = body; // action: "APPROVE" | "REJECT"

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ success: false, error: "action must be either APPROVE or REJECT" }, { status: 400 });
    }

    const claim = await prisma.reimbursementClaim.findUnique({
      where: { id },
      include: { volunteer: true },
    });

    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "SUBMITTED") {
      return NextResponse.json(
        { success: false, error: `Claim has already been processed (Current status: ${claim.status}).` },
        { status: 409 }
      );
    }

    let reviewerId = session?.userId;
    if (!reviewerId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "TREASURER"] } },
      });
      reviewerId = adminUser?.id;
    }

    if (action === "REJECT") {
      const updated = await prisma.reimbursementClaim.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedById: reviewerId,
          reviewNotes: reviewNotes || "Claim rejected by treasurer.",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Claim rejected.",
        claim: updated,
      });
    }

    // Action === "APPROVE": Atomic update with FinancialTransaction creation
    const result = await prisma.$transaction(async (tx) => {
      const txnNumber = `TXN-CLM-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const financialTxn = await tx.financialTransaction.create({
        data: {
          transactionNumber: txnNumber,
          type: "EXPENSE",
          sourceModule: "REIMBURSEMENT",
          amount: claim.amount,
          referenceId: claim.claimNumber,
          semesterPeriod: `SPRING_${new Date().getFullYear()}`,
          description: `Approved reimbursement (${claim.claimNumber}) for ${claim.volunteer.name}: ${claim.description}`,
        },
      });

      const updatedClaim = await tx.reimbursementClaim.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedById: reviewerId,
          reviewNotes: reviewNotes || "Approved and disbursed.",
          reviewedAt: new Date(),
          financialTxnId: financialTxn.id,
        },
        include: {
          volunteer: { select: { name: true, email: true } },
          reviewedBy: { select: { name: true } },
        },
      });

      return { updatedClaim, financialTxn };
    });

    return NextResponse.json({
      success: true,
      message: "Claim approved and recorded to financial ledger.",
      claim: result.updatedClaim,
      transaction: result.financialTxn,
    });
  } catch (error) {
    console.error("PATCH /api/finance/claims/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
