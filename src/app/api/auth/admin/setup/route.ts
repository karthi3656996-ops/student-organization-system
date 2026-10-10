import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

/**
 * POST /api/auth/admin/setup
 *
 * One-time admin account setup. Can ONLY create an admin if:
 *   1. The ADMIN_SETUP_TOKEN env variable is set AND
 *   2. The request provides a matching setup_token AND
 *   3. No ADMIN user already exists in the database.
 *
 * This endpoint is intentionally disabled after first use.
 * Set ADMIN_SETUP_TOKEN in your .env to use it.
 */
export async function POST(request: Request) {
  const SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN;

  if (!SETUP_TOKEN || SETUP_TOKEN.length < 16) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Admin setup is disabled. Set ADMIN_SETUP_TOKEN (min 16 chars) in your .env to enable this endpoint.",
      },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "Invalid body." }, { status: 400 });
  }

  const { setup_token, name, email, password } = body;

  // Verify the setup token
  if (!setup_token || setup_token !== SETUP_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Invalid setup token." },
      { status: 403 }
    );
  }

  // Ensure no admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (existingAdmin) {
    return NextResponse.json(
      {
        success: false,
        error:
          "An admin account already exists. This endpoint is disabled after initial setup.",
      },
      { status: 409 }
    );
  }

  // Validate inputs
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ success: false, error: "Name must be at least 2 characters." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return NextResponse.json({ success: false, error: "Valid email required." }, { status: 400 });
  }

  if (!password || typeof password !== "string" || password.length < 12) {
    return NextResponse.json(
      { success: false, error: "Admin password must be at least 12 characters." },
      { status: 400 }
    );
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (existingEmail) {
    return NextResponse.json(
      { success: false, error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`[ADMIN SETUP] Admin account created: ${admin.email}`);

  return NextResponse.json(
    {
      success: true,
      message: "Admin account created successfully. Remove ADMIN_SETUP_TOKEN from your .env now.",
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    },
    { status: 201 }
  );
}
