import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const audienceParam = searchParams.get("audience")?.trim();
    const priorityParam = searchParams.get("priority")?.trim();
    const limitParam = searchParams.get("limit");

    const whereClause: Record<string, string> = {};

    if (audienceParam && ["ALL", "MEMBERS_ONLY", "VOLUNTEERS"].includes(audienceParam)) {
      whereClause.audience = audienceParam;
    }

    if (priorityParam && ["NORMAL", "URGENT"].includes(priorityParam)) {
      whereClause.priority = priorityParam;
    }

    const take = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 50;

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take,
    });

    const formattedAnnouncements = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      priority: a.priority,
      audience: a.audience,
      publishedAt: a.publishedAt,
      emailDispatched: a.emailDispatched,
      author: {
        id: a.author.id,
        name: a.author.name,
        role: a.author.role,
      },
    }));

    return NextResponse.json({
      success: true,
      count: formattedAnnouncements.length,
      announcements: formattedAnnouncements,
    });
  } catch (error) {
    console.error("GET /api/announcements error:", error);
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
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { title, content, priority, audience, authorId, authorEmail } = body;

    // 1. Validation
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Title must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Content must be at least 5 characters." },
        { status: 400 }
      );
    }

    const validPriorities = ["NORMAL", "URGENT"];
    const chosenPriority = (priority && validPriorities.includes(priority)) ? priority : "NORMAL";

    const validAudiences = ["ALL", "MEMBERS_ONLY", "VOLUNTEERS"];
    const chosenAudience = (audience && validAudiences.includes(audience)) ? audience : "ALL";

    // 2. Resolve Author using an existing, verified User in the database
    let resolvedAuthor = null;

    if (authorId && typeof authorId === "string") {
      resolvedAuthor = await prisma.user.findUnique({
        where: { id: authorId.trim() },
      });
    } else if (authorEmail && typeof authorEmail === "string") {
      resolvedAuthor = await prisma.user.findUnique({
        where: { email: authorEmail.trim().toLowerCase() },
      });
    } else {
      // Pick existing officer/admin user, or any active user
      resolvedAuthor = await prisma.user.findFirst({
        where: {
          role: { in: ["ADMIN", "EVENT_LEAD", "TREASURER", "MEMBER"] },
        },
      });
      if (!resolvedAuthor) {
        resolvedAuthor = await prisma.user.findFirst();
      }
    }

    if (!resolvedAuthor) {
      return NextResponse.json(
        {
          success: false,
          error: "No registered author found in system. A valid User record is required to author announcements.",
        },
        { status: 400 }
      );
    }

    // 3. Create announcement in database
    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        priority: chosenPriority,
        audience: chosenAudience,
        authorId: resolvedAuthor.id,
        emailDispatched: false, // Honest: no external email provider configured
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Announcement published successfully.",
        announcement: {
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          audience: announcement.audience,
          publishedAt: announcement.publishedAt,
          emailDispatched: announcement.emailDispatched,
          author: {
            id: announcement.author.id,
            name: announcement.author.name,
            role: announcement.author.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


