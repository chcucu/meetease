import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { codes } = await request.json();
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ success: true, activities: [] });
    }

    const activities = await prisma.activity.findMany({
      where: { shareCode: { in: codes } },
      include: {
        _count: { select: { participants: true, timeOptions: true, suggestions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error("Batch fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch activities" }, { status: 500 });
  }
}