import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";

// GET /api/finance/claims — List reimbursement claims
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status")?.toUpperCase();
    const limitParam = searchParams.get("limit");

    const take = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 50;

    const whereClause: Record<string, unknown> = {};
    if (statusParam && ["SUBMITTED", "APPROVED", "REJECTED", "REIMBURSED"].includes(statusParam)) {
      whereClause.status = statusParam;
    }

    const claims = await prisma.reimbursementClaim.findMany({
      where: whereClause,
      include: {
        volunteer: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        financialTxn: { select: { transactionNumber: true, recordedAt: true } },
      },
      orderBy: { submittedAt: "desc" },
      take,
    });

    const formatted = claims.map((c) => ({
      id: c.id,
      claimNumber: c.claimNumber,
      category: c.category,
      amount: Number(c.amount),
      description: c.description,
      receiptUrl: c.receiptUrl,
      status: c.status,
      volunteer: c.volunteer,
      reviewedBy: c.reviewedBy,
      reviewNotes: c.reviewNotes,
      submittedAt: c.submittedAt.toISOString(),
      reviewedAt: c.reviewedAt ? c.reviewedAt.toISOString() : null,
      financialTxn: c.financialTxn,
    }));

    return NextResponse.json({ success: true, count: formatted.length, claims: formatted });
  } catch (error) {
    console.error("GET /api/finance/claims error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/finance/claims — Submit a new reimbursement claim
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { category, amount, description, receiptUrl, volunteerId, volunteerEmail } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: "Valid positive amount is required" }, { status: 400 });
    }

    // Resolve volunteer
    let resolvedVolunteerId = session?.userId;
    if (!resolvedVolunteerId && volunteerId) {
      const u = await prisma.user.findUnique({ where: { id: volunteerId } });
      if (u) resolvedVolunteerId = u.id;
    }
    if (!resolvedVolunteerId && volunteerEmail) {
      const u = await prisma.user.findUnique({ where: { email: volunteerEmail.trim().toLowerCase() } });
      if (u) resolvedVolunteerId = u.id;
    }
    if (!resolvedVolunteerId) {
      // Pick any member or first user
      const firstUser = await prisma.user.findFirst();
      if (firstUser) resolvedVolunteerId = firstUser.id;
    }

    if (!resolvedVolunteerId) {
      return NextResponse.json({ success: false, error: "Valid user record required to submit claim" }, { status: 400 });
    }

    const claimNumber = `CLM-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const claim = await prisma.reimbursementClaim.create({
      data: {
        claimNumber,
        volunteerId: resolvedVolunteerId,
        category: category || "SUPPLIES",
        amount: numAmount,
        description: description || "Reimbursement claim with digital receipt",
        receiptUrl: receiptUrl || "/receipts/receipt-placeholder.png",
        status: "SUBMITTED",
      },
      include: {
        volunteer: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reimbursement claim submitted successfully for Treasurer review.",
        claim: {
          id: claim.id,
          claimNumber: claim.claimNumber,
          category: claim.category,
          amount: Number(claim.amount),
          status: claim.status,
          volunteer: claim.volunteer,
          submittedAt: claim.submittedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/finance/claims error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
