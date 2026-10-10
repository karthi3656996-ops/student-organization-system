import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // ── Find user with member profile ───────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberProfile: {
          select: {
            id: true,
            studentId: true,
            status: true,
            validUntil: true,
          },
        },
      },
    });

    // Generic message prevents email enumeration
    const invalidCredentials = {
      success: false,
      error: "Invalid email or password. Please try again.",
    };

    if (!user) {
      return NextResponse.json(invalidCredentials, { status: 401 });
    }

    // Check if account was created via table signup (no real password)
    if (user.passwordHash === "unassigned_table_signup") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account was registered at the membership desk and does not have a portal password. Please use the 'Register' option to set up your portal account.",
        },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(invalidCredentials, { status: 401 });
    }

    // ── Create Session ──────────────────────────────────────────────
    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      memberId: user.memberProfile?.id ?? null,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberProfile?.id ?? null,
        studentId: user.memberProfile?.studentId ?? null,
        membershipStatus: user.memberProfile?.status ?? null,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
