import { NextRequest } from "next/server";
import { fail, ok, readBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { suggestionVoteSchema } from "@/lib/validation";

type Context = { params: Promise<{ code: string; id: string }> };

export async function POST(request: NextRequest, context: Context) {
  const { code, id } = await context.params;
  const data = await readBody(request, suggestionVoteSchema);
  if (data instanceof Response) return data;

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code.toUpperCase() },
    select: { id: true, shareCode: true, status: true },
  });
  if (!activity) return fail("没有找到这个活动", 404);
  if (activity.status !== "open") return fail("投票已经结束了", 409);

  const suggestion = await prisma.suggestion.findFirst({
    where: { id, activityId: activity.id },
    select: { id: true },
  });
  if (!suggestion) return fail("提议不存在", 404);

  const participant = await prisma.participant.findUnique({
    where: {
      activityId_clientKey: { activityId: activity.id, clientKey: data.clientKey },
    },
    select: { id: true },
  });
  if (!participant) return fail("请先提交你的选择，再附议", 403);

  const existing = await prisma.suggestionVote.findUnique({
    where: {
      participantId_suggestionId: {
        participantId: participant.id,
        suggestionId: suggestion.id,
      },
    },
  });

  if (existing) {
    await prisma.suggestionVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.suggestionVote.create({
      data: { participantId: participant.id, suggestionId: suggestion.id },
    });
  }

  const votes = await prisma.suggestionVote.count({ where: { suggestionId: suggestion.id } });
  publish(activity.shareCode);

  return ok({ upvoted: !existing, votes });
}
