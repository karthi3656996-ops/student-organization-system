import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/fundraising — List all fundraiser campaigns
export async function GET() {
  try {
    const campaigns = await prisma.fundraiserCampaign.findMany({
      include: {
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      targetAmount: Number(c.targetAmount),
      currentAmount: Number(c.currentAmount),
      progressPercent: Math.min(100, Math.round((Number(c.currentAmount) / Math.max(1, Number(c.targetAmount))) * 100)),
      status: c.status,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate ? c.endDate.toISOString() : null,
      tasksCount: c.tasks.length,
      tasks: c.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        assignedTo: t.assignedTo,
      })),
    }));

    return NextResponse.json({ success: true, campaigns: formatted });
  } catch (error) {
    console.error("GET /api/fundraising error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/fundraising — Create a new fundraiser campaign
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON request" }, { status: 400 });
    }

    const { title, description, targetAmount, initialRaised = 0, startDate, endDate } = body;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Title must be at least 2 characters." }, { status: 400 });
    }

    const target = Number(targetAmount);
    if (isNaN(target) || target <= 0) {
      return NextResponse.json({ success: false, error: "targetAmount must be a positive number." }, { status: 400 });
    }

    const campaign = await prisma.fundraiserCampaign.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : "Campaign for student organization initiatives.",
        targetAmount: target,
        currentAmount: Number(initialRaised) || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Fundraiser campaign created.",
      campaign: {
        id: campaign.id,
        title: campaign.title,
        targetAmount: Number(campaign.targetAmount),
        currentAmount: Number(campaign.currentAmount),
        status: campaign.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fundraising error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
