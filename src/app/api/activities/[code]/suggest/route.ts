import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { content, authorName, type } = body;

    const activity = await prisma.activity.findUnique({ where: { shareCode: code } });
    if (!activity) {
      return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });
    }

    if (!activity.allowSuggestions) {
      return NextResponse.json({ success: false, error: "Suggestions are not allowed for this activity" }, { status: 403 });
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        activityId: activity.id,
        content,
        authorName: authorName || "Anonymous",
        type: type || "other",
      },
    });

    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    console.error("Suggest error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit suggestion" }, { status: 500 });
  }
}