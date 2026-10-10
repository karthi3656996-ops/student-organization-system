import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, email, password, studentId, department, graduationYear, phoneNumber } = body;

    // ── Validation ──────────────────────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (!studentId || typeof studentId !== "string" || studentId.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Student ID must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!department || typeof department !== "string" || !department.trim()) {
      return NextResponse.json(
        { success: false, error: "Department is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanDept = department.trim();
    const cleanPhone = typeof phoneNumber === "string" && phoneNumber.trim() ? phoneNumber.trim() : "N/A";

    const currentYear = new Date().getFullYear();
    let parsedGradYear = currentYear + 2;
    if (graduationYear !== undefined && graduationYear !== null && graduationYear !== "") {
      const y = Number(graduationYear);
      if (!Number.isInteger(y) || y < currentYear || y > currentYear + 8) {
        return NextResponse.json(
          { success: false, error: `Graduation year must be between ${currentYear} and ${currentYear + 8}.` },
          { status: 400 }
        );
      }
      parsedGradYear = y;
    }

    // ── Uniqueness Checks ───────────────────────────────────────────
    const [existingEmail, existingStudentId] = await Promise.all([
      prisma.user.findUnique({ where: { email: cleanEmail } }),
      prisma.member.findUnique({ where: { studentId: cleanStudentId } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    if (existingStudentId) {
      return NextResponse.json(
        { success: false, error: `Student ID "${cleanStudentId}" is already registered.` },
        { status: 409 }
      );
    }

    // ── Hash Password ───────────────────────────────────────────────
    const passwordHash = await hashPassword(password);

    // ── Atomic DB Transaction ───────────────────────────────────────
    const { user, member } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          passwordHash,
          role: "MEMBER",
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          studentId: cleanStudentId,
          department: cleanDept,
          graduationYear: parsedGradYear,
          phoneNumber: cleanPhone,
          status: "PENDING_PAYMENT",
        },
      });

      return { user, member };
    });

    // ── Create Session ──────────────────────────────────────────────
    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      memberId: member.id,
    });

    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Welcome to Skyline!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          memberId: member.id,
          studentId: member.studentId,
          membershipStatus: member.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
