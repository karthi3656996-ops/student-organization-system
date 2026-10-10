import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/merch — List all active merchandise items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";

    const items = await prisma.merchItem.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      basePrice: Number(item.basePrice),
      memberPrice: Number(item.memberPrice),
      isActive: item.isActive,
      variants: item.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stockQuantity: v.stockQuantity,
      })),
    }));

    return NextResponse.json({ success: true, items: formatted });
  } catch (error) {
    console.error("GET /api/merch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/merch — Create a new merch item (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { name, description, imageUrl, basePrice, memberPrice, variants } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Item name must be at least 2 characters." },
        { status: 400 }
      );
    }
    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { success: false, error: "Description is required." },
        { status: 400 }
      );
    }
    const cleanImageUrl =
      typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : "/merch-placeholder.png";

    const priceBase = Number(basePrice);
    const priceMember = Number(memberPrice);
    if (isNaN(priceBase) || priceBase < 0) {
      return NextResponse.json(
        { success: false, error: "basePrice must be a non-negative number." },
        { status: 400 }
      );
    }
    if (isNaN(priceMember) || priceMember < 0) {
      return NextResponse.json(
        { success: false, error: "memberPrice must be a non-negative number." },
        { status: 400 }
      );
    }

    // Parse variants
    const variantsData: { size: string; color: string; stockQuantity: number }[] = [];
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (!v.size || typeof v.size !== "string") {
          return NextResponse.json(
            { success: false, error: "Each variant must have a size." },
            { status: 400 }
          );
        }
        const qty = Number(v.stockQuantity);
        if (!Number.isInteger(qty) || qty < 0) {
          return NextResponse.json(
            { success: false, error: "stockQuantity must be a non-negative integer." },
            { status: 400 }
          );
        }
        variantsData.push({
          size: v.size.trim().toUpperCase(),
          color: typeof v.color === "string" ? v.color.trim() : "Standard",
          stockQuantity: qty,
        });
      }
    }

    const item = await prisma.merchItem.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        imageUrl: cleanImageUrl,
        basePrice: priceBase,
        memberPrice: priceMember,
        isActive: true,
        variants: {
          create: variantsData,
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Merchandise item created successfully.",
        item: {
          id: item.id,
          name: item.name,
          basePrice: Number(item.basePrice),
          memberPrice: Number(item.memberPrice),
          variants: item.variants,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/merch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


