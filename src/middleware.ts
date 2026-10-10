import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "skyline-fallback-secret-change-in-production"
);

const COOKIE_NAME = "skyline_session";

interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin Portal Protection ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow the admin login page itself
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const session = await getSession(request);

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Server-side role check — never trust frontend
    if (session.role !== "ADMIN" && session.role !== "TREASURER" && session.role !== "EVENT_LEAD") {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // ── Student Portal Protection ────────────────────────────────────
  if (pathname.startsWith("/student")) {
    // Allow student login/register/forgot-password pages
    if (pathname === "/student/login" || pathname === "/student/register" || pathname === "/student/forgot-password") {
      return NextResponse.next();
    }

    const session = await getSession(request);

    if (!session) {
      return NextResponse.redirect(new URL("/student/login", request.url));
    }

    return NextResponse.next();
  }

  // ── Protected API Routes ─────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN" && session.role !== "TREASURER" && session.role !== "EVENT_LEAD") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/api/admin/:path*",
  ],
};
