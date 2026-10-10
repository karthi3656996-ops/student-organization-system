import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!studentId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Must provide either studentId or email query parameter.",
        },
        { status: 400 }
      );
    }

    // Lookup member by studentId or user email
    let member = null;

    if (studentId) {
      member = await prisma.member.findUnique({
        where: { studentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    } else if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          memberProfile: true,
        },
      });

      if (user && user.memberProfile) {
        member = {
          ...user.memberProfile,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }
    }

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: "Member not found.",
        },
        { status: 404 }
      );
    }

    // Return sanitized safe member details (no passwordHash or internal security keys)
    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        studentId: member.studentId,
        department: member.department,
        graduationYear: member.graduationYear,
        phoneNumber: member.phoneNumber,
        status: member.status,
        validFrom: member.validFrom,
        validUntil: member.validUntil,
        memberQrToken: member.memberQrToken,
        createdAt: member.createdAt,
        name: member.user.name,
        email: member.user.email,
        role: member.user.role,
      },
    });
  } catch (error) {
    console.error("GET /api/members/lookup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}


