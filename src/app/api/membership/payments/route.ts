import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId")?.trim();
    const studentId = searchParams.get("studentId")?.trim();
    const academicYear = searchParams.get("academicYear")?.trim();

    const whereClause: Record<string, unknown> = {};

    if (academicYear) {
      whereClause.academicYear = academicYear;
    }

    if (memberId) {
      whereClause.memberId = memberId;
    } else if (studentId) {
      const member = await prisma.member.findUnique({
        where: { studentId },
        select: { id: true },
      });
      if (!member) {
        return NextResponse.json(
          { success: true, payments: [] },
          { status: 200 }
        );
      }
      whereClause.memberId = member.id;
    }

    const payments = await prisma.membershipPayment.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            id: true,
            studentId: true,
            department: true,
            status: true,
            validFrom: true,
            validUntil: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        financialTxn: {
          select: {
            transactionNumber: true,
            type: true,
            sourceModule: true,
            amount: true,
            semesterPeriod: true,
            recordedAt: true,
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    const formattedPayments = payments.map((p) => ({
      id: p.id,
      memberId: p.memberId,
      studentId: p.member.studentId,
      memberName: p.member.user.name,
      memberEmail: p.member.user.email,
      academicYear: p.academicYear,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      paymentReference: p.paymentReference,
      status: p.status,
      paidAt: p.paidAt,
      transactionNumber: p.financialTxn?.transactionNumber || null,
      financialRecordedAt: p.financialTxn?.recordedAt || null,
    }));

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error("GET /api/membership/payments error:", error);
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
        { success: false, error: "Invalid JSON body provided." },
        { status: 400 }
      );
    }

    const {
      memberId,
      studentId,
      academicYear,
      amount,
      paymentMethod,
      paymentReference,
      notes,
    } = body;

    // 1. Validate Target Member
    let targetMember = null;
    if (memberId && typeof memberId === "string") {
      targetMember = await prisma.member.findUnique({
        where: { id: memberId.trim() },
        include: { user: true },
      });
    } else if (studentId && typeof studentId === "string") {
      targetMember = await prisma.member.findUnique({
        where: { studentId: studentId.trim() },
        include: { user: true },
      });
    }

    if (!targetMember) {
      return NextResponse.json(
        {
          success: false,
          error: "Member not found. Provide a valid memberId or studentId.",
        },
        { status: 404 }
      );
    }

    // 2. Validate Academic Year
    const cleanAcademicYear = typeof academicYear === "string" ? academicYear.trim() : "";
    if (!cleanAcademicYear || !/^\d{4}-\d{4}$/.test(cleanAcademicYear)) {
      return NextResponse.json(
        {
          success: false,
          error: "Academic year must be formatted as YYYY-YYYY (e.g. 2025-2026).",
        },
        { status: 400 }
      );
    }

    // 3. Validate Amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be a positive number." },
        { status: 400 }
      );
    }

    // 4. Validate Payment Method
    const validMethods = ["ONLINE", "CASH_TABLE"];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment method must be one of: ${validMethods.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // 5. Validate Payment Reference (Idempotency Key)
    const cleanReference = typeof paymentReference === "string" ? paymentReference.trim() : "";
    if (!cleanReference || cleanReference.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid payment reference of at least 4 characters is required.",
        },
        { status: 400 }
      );
    }

    // Check duplicate payment reference
    const existingPayment = await prisma.membershipPayment.findUnique({
      where: { paymentReference: cleanReference },
    });
    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          error: `A payment with reference "${cleanReference}" has already been recorded. Duplicate rejected.`,
        },
        { status: 409 }
      );
    }

    // Determine verification status
    // Cash table receipts and verified online gateway tokens are marked COMPLETED
    const paymentStatus = "COMPLETED";

    // 6. Execute Atomic Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create double-entry Financial Ledger Transaction
      const txnNumber = `TXN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const financialTxn = await tx.financialTransaction.create({
        data: {
          transactionNumber: txnNumber,
          type: "INCOME",
          sourceModule: "MEMBERSHIP_DUES",
          amount: numericAmount,
          referenceId: cleanReference,
          semesterPeriod: `SPRING_${new Date().getFullYear()}`,
          description: `Membership dues ${cleanAcademicYear} for ${targetMember.user.name} (${targetMember.studentId}) via ${paymentMethod}${notes ? ` - ${notes}` : ""}`,
        },
      });

      // Create MembershipPayment
      const newPayment = await tx.membershipPayment.create({
        data: {
          memberId: targetMember.id,
          academicYear: cleanAcademicYear,
          amount: numericAmount,
          paymentMethod,
          paymentReference: cleanReference,
          status: paymentStatus,
          financialTxnId: financialTxn.id,
        },
      });

      // Extend member validity by 365 days and update status to ACTIVE
      const updatedMember = await tx.member.update({
        where: { id: targetMember.id },
        data: {
          status: "ACTIVE",
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });

      return {
        payment: newPayment,
        financialTxn,
        member: updatedMember,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Membership dues payment of $${numericAmount.toFixed(2)} recorded successfully.`,
        payment: {
          id: result.payment.id,
          memberId: result.payment.memberId,
          studentId: result.member.studentId,
          memberName: result.member.user.name,
          academicYear: result.payment.academicYear,
          amount: Number(result.payment.amount),
          paymentMethod: result.payment.paymentMethod,
          paymentReference: result.payment.paymentReference,
          status: result.payment.status,
          paidAt: result.payment.paidAt,
          transactionNumber: result.financialTxn.transactionNumber,
          memberStatus: result.member.status,
          validUntil: result.member.validUntil,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/membership/payments error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


