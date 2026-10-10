import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/merch/orders — List orders (optionally filter by userId or orderNumber)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limitParam = searchParams.get("limit");
    const take = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 50;

    const orders = await prisma.merchOrder.findMany({
      where: userId ? { userId } : {},
      include: {
        items: {
          include: {
            variant: {
              include: { merchItem: { select: { name: true, imageUrl: true } } },
            },
          },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyerName: o.user.name,
      buyerEmail: o.user.email,
      totalAmount: Number(o.totalAmount),
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      pickupCode: o.pickupCode,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i.id,
        itemName: i.variant.merchItem.name,
        imageUrl: i.variant.merchItem.imageUrl,
        size: i.variant.size,
        color: i.variant.color,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.unitPrice) * i.quantity,
      })),
    }));

    return NextResponse.json({ success: true, orders: formatted });
  } catch (error) {
    console.error("GET /api/merch/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/merch/orders — Place a new merchandise order
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { userId, items, memberStudentId } = body;

    // 1. Validate user exists
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "userId is required." },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { memberProfile: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const isMember =
      user.memberProfile?.status === "ACTIVE" ||
      (typeof memberStudentId === "string" &&
        !!(await prisma.member.findUnique({
          where: { studentId: memberStudentId.trim() },
        })));

    // 2. Validate order items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required." },
        { status: 400 }
      );
    }

    // 3. Resolve variants and check stock
    type OrderLineItem = {
      variantId: string;
      quantity: number;
      unitPrice: number;
      variant: { id: string; stockQuantity: number; size: string; color: string; merchItem: { name: string; basePrice: number; memberPrice: number } };
    };
    const resolvedItems: OrderLineItem[] = [];

    for (const item of items) {
      if (!item.variantId || typeof item.variantId !== "string") {
        return NextResponse.json(
          { success: false, error: "Each item must have a variantId." },
          { status: 400 }
        );
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return NextResponse.json(
          { success: false, error: "quantity must be a positive integer." },
          { status: 400 }
        );
      }

      const variant = await prisma.merchVariant.findUnique({
        where: { id: item.variantId },
        include: { merchItem: true },
      });
      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Variant ${item.variantId} not found.` },
          { status: 404 }
        );
      }
      if (!variant.merchItem.isActive) {
        return NextResponse.json(
          { success: false, error: `Item "${variant.merchItem.name}" is no longer available.` },
          { status: 400 }
        );
      }
      if (variant.stockQuantity < qty) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${variant.merchItem.name}" (${variant.size}). Only ${variant.stockQuantity} left.`,
          },
          { status: 409 }
        );
      }

      const unitPrice = isMember
        ? Number(variant.merchItem.memberPrice)
        : Number(variant.merchItem.basePrice);

      resolvedItems.push({ variantId: item.variantId, quantity: qty, unitPrice, variant: { ...variant, merchItem: { ...variant.merchItem, basePrice: Number(variant.merchItem.basePrice), memberPrice: Number(variant.merchItem.memberPrice) } } });
    }

    // 4. Calculate total
    const totalAmount = resolvedItems.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;
    const pickupCode = `PICKUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 5. Atomic transaction: deduct stock, create order, write ledger
    const result = await prisma.$transaction(async (tx) => {
      // Deduct stock for each variant
      for (const item of resolvedItems) {
        await tx.merchVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      const isFree = totalAmount === 0;

      // Create the order with PENDING_PAYMENT status until payment verification succeeds
      const order = await tx.merchOrder.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          paymentStatus: isFree ? "PAID" : "PENDING_PAYMENT",
          fulfillmentStatus: "PENDING",
          pickupCode,
          items: {
            create: resolvedItems.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          },
        },
        include: {
          items: {
            include: {
              variant: { include: { merchItem: { select: { name: true } } } },
            },
          },
        },
      });

      return { order };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        order: {
          id: result.order.id,
          orderNumber: result.order.orderNumber,
          totalAmount: Number(result.order.totalAmount),
          pickupCode: result.order.pickupCode,
          paymentStatus: result.order.paymentStatus,
          fulfillmentStatus: result.order.fulfillmentStatus,
          items: result.order.items.map((i) => ({
            name: i.variant.merchItem.name,
            size: i.variant.size,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/merch/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/merch/orders — Update order fulfillment status
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || !body.orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required." },
        { status: 400 }
      );
    }

    const { orderId, fulfillmentStatus } = body;
    const validStatuses = ["PENDING", "READY_FOR_PICKUP", "COMPLETED"];
    if (!fulfillmentStatus || !validStatuses.includes(fulfillmentStatus)) {
      return NextResponse.json(
        { success: false, error: "Valid fulfillmentStatus required (PENDING, READY_FOR_PICKUP, COMPLETED)." },
        { status: 400 }
      );
    }

    const updated = await prisma.merchOrder.update({
      where: { id: orderId },
      data: { fulfillmentStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Order fulfillment updated to ${fulfillmentStatus}.`,
      order: updated,
    });
  } catch (error) {
    console.error("PATCH /api/merch/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


