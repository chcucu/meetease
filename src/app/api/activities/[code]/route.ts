import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const activity = await prisma.activity.findUnique({
      where: { shareCode: code },
      include: {
        customFields: { orderBy: { sortOrder: "asc" } },
        timeOptions: { include: { _count: { select: { votes: true } } } },
        locationOptions: { include: { _count: { select: { votes: true } } } },
        suggestions: {
          include: { _count: { select: { votes: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("Get activity error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch activity" }, { status: 500 });
  }
}