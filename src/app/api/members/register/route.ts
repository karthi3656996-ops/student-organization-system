import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request payload. Expected JSON body." },
        { status: 400 }
      );
    }

    const { name, studentId, department, email, graduationYear, phoneNumber } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Full name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!studentId || typeof studentId !== "string" || studentId.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Student ID must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!department || typeof department !== "string" || !department.trim()) {
      return NextResponse.json(
        { success: false, message: "Department is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanDept = department.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Parse graduationYear if provided, else default to current year + 2
    let parsedGraduationYear = new Date().getFullYear() + 2;
    if (graduationYear !== undefined && graduationYear !== null && graduationYear !== "") {
      const yearNum = Number(graduationYear);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(yearNum) || yearNum < currentYear || yearNum > currentYear + 8) {
        return NextResponse.json(
          { success: false, message: `Graduation year must be an integer between ${currentYear} and ${currentYear + 8}.` },
          { status: 400 }
        );
      }
      parsedGraduationYear = yearNum;
    }

    const cleanPhone = (typeof phoneNumber === "string" && phoneNumber.trim()) ? phoneNumber.trim() : "N/A";

    // 2. Check for duplicate Student ID
    const existingMember = await prisma.member.findUnique({
      where: { studentId: cleanStudentId },
    });
    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          message: `A member with Student ID "${cleanStudentId}" is already registered.`,
        },
        { status: 409 }
      );
    }

    // 3. Check for duplicate Email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: `A user with email "${cleanEmail}" is already registered.`,
        },
        { status: 409 }
      );
    }

    // 4. Save User and Member in a Prisma Transaction
    const newMemberRecord = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          passwordHash: "unassigned_table_signup",
          role: "MEMBER",
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          studentId: cleanStudentId,
          department: cleanDept,
          graduationYear: parsedGraduationYear,
          phoneNumber: cleanPhone,
          status: "ACTIVE",
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        id: member.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        studentId: member.studentId,
        department: member.department,
        status: member.status,
        memberQrToken: member.memberQrToken,
        createdAt: member.createdAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Membership registration completed successfully.",
        member: newMemberRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Member registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Database error: ${errMessage}`,
      },
      { status: 500 }
    );
  }
}
