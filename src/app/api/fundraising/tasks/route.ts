import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/fundraising/tasks — Get volunteer tasks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    const tasks = await prisma.volunteerTask.findMany({
      where: campaignId ? { campaignId } : {},
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      campaignId: t.campaignId,
      campaignTitle: t.campaign?.title ?? null,
      assignedTo: t.assignedTo,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, tasks: formatted });
  } catch (error) {
    console.error("GET /api/fundraising/tasks error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/fundraising/tasks — Create a volunteer task
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON request" }, { status: 400 });
    }

    const { title, description, campaignId, assignedToId, assignedToEmail, priority = "MEDIUM", dueDate, status = "TO_DO" } = body;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Task title must be at least 2 characters." }, { status: 400 });
    }

    let resolvedAssigneeId = assignedToId;
    if (!resolvedAssigneeId && assignedToEmail) {
      const u = await prisma.user.findUnique({ where: { email: assignedToEmail.trim().toLowerCase() } });
      if (u) resolvedAssigneeId = u.id;
    }

    const validStatus = ["TO_DO", "IN_PROGRESS", "DONE"].includes(status) ? status : "TO_DO";

    const task = await prisma.volunteerTask.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : "",
        campaignId: campaignId || null,
        assignedToId: resolvedAssigneeId || null,
        priority: ["LOW", "MEDIUM", "HIGH"].includes(priority) ? priority : "MEDIUM",
        status: validStatus as "TO_DO" | "IN_PROGRESS" | "DONE",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Volunteer task created.",
      task,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fundraising/tasks error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/fundraising/tasks — Update task status or assignment
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || !body.id) {
      return NextResponse.json({ success: false, error: "Task ID is required." }, { status: 400 });
    }

    const { id, status, priority, assignedToId } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (status && ["TO_DO", "IN_PROGRESS", "DONE"].includes(status)) {
      dataToUpdate.status = status;
    }
    if (priority && ["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      dataToUpdate.priority = priority;
    }
    if (assignedToId !== undefined) {
      dataToUpdate.assignedToId = assignedToId;
    }

    const updated = await prisma.volunteerTask.update({
      where: { id },
      data: dataToUpdate,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, message: "Task updated.", task: updated });
  } catch (error) {
    console.error("PATCH /api/fundraising/tasks error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
