import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const statusParam = searchParams.get("status");
    const departmentParam = searchParams.get("department");

    const take = limitParam
      ? Math.min(200, Math.max(1, parseInt(limitParam, 10)))
      : 100;

    const whereClause: Record<string, unknown> = {};
    if (statusParam && ["ACTIVE", "PENDING_PAYMENT", "EXPIRED", "REVOKED"].includes(statusParam)) {
      whereClause.status = statusParam;
    }
    if (departmentParam) {
      whereClause.department = {
        contains: departmentParam,
      };
    }

    const members = await prisma.member.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    });

    const formatted = members.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      name: m.user.name,
      email: m.user.email,
      department: m.department,
      graduationYear: m.graduationYear,
      phoneNumber: m.phoneNumber,
      status: m.status,
      validFrom: m.validFrom,
      validUntil: m.validUntil,
      memberQrToken: m.memberQrToken,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      members: formatted,
    });
  } catch (error) {
    console.error("GET /api/members error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


