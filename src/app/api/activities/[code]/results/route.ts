import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const activity = await prisma.activity.findUnique({ where: { shareCode: code } });

    if (!activity) {
      return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });
    }

    const [timeOptions, locationOptions, suggestions, participantCount] = await Promise.all([
      prisma.timeOption.findMany({
        where: { activityId: activity.id },
        include: { _count: { select: { votes: true } } },
      }),
      prisma.locationOption.findMany({
        where: { activityId: activity.id },
        include: { _count: { select: { votes: true } } },
      }),
      prisma.suggestion.findMany({
        where: { activityId: activity.id },
        include: { _count: { select: { votes: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.participant.count({ where: { activityId: activity.id } }),
    ]);

    return NextResponse.json({
      success: true,
      results: { timeOptions, locationOptions, suggestions, participantCount },
    });
  } catch (error) {
    console.error("Results error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch results" }, { status: 500 });
  }
}