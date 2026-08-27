import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateParticipantId } from "@/lib/utils";

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { participantId, participantName, timeOptionIds, locationOptionIds, customData } = body;

    const activity = await prisma.activity.findUnique({ where: { shareCode: code } });
    if (!activity) {
      return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });
    }

    const pid = participantId || generateParticipantId();

    const participant = await prisma.participant.upsert({
      where: { id: pid },
      update: { name: participantName, customData: customData ? JSON.stringify(customData) : undefined },
      create: { id: pid, activityId: activity.id, name: participantName || "Anonymous", customData: customData ? JSON.stringify(customData) : null },
    });

    // Delete existing votes for this participant
    await prisma.vote.deleteMany({ where: { participantId: participant.id, activityId: activity.id } });

    // Create new votes
    const votes = [];
    if (timeOptionIds) {
      for (const timeOptionId of timeOptionIds) {
        votes.push({ activityId: activity.id, participantId: participant.id, timeOptionId });
      }
    }
    if (locationOptionIds) {
      for (const locationOptionId of locationOptionIds) {
        votes.push({ activityId: activity.id, participantId: participant.id, locationOptionId });
      }
    }

    if (votes.length > 0) {
      await prisma.vote.createMany({ data: votes });
    }

    return NextResponse.json({ success: true, participantId: participant.id });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit vote" }, { status: 500 });
  }
}