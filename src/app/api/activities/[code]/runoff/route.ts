import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { getSessionUserFromRequest } from "@/lib/session";
import { tiedTopOptionIds } from "@/lib/tally";

type Context = { params: Promise<{ code: string }> };

const RUNOFF_WINDOW_MS = 2 * 60 * 60 * 1000;

export async function POST(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code.toUpperCase(), ownerId: user.id },
    select: {
      id: true,
      shareCode: true,
      status: true,
      deadline: true,
      options: {
        select: {
          id: true,
          kind: true,
          votes: {
            select: {
              value: true,
              rank: true,
              participantId: true,
              participant: { select: { weight: true } },
            },
          },
        },
      },
    },
  });
  if (!activity) return fail("活动不存在或无权操作", 404);
  if (activity.status === "closed") return fail("活动已结束，无法发起决胜轮", 409);

  const tiedIds = Array.from(
    new Set([
      ...tiedTopOptionIds(activity.options, "time"),
      ...tiedTopOptionIds(activity.options, "place"),
    ])
  );
  if (tiedIds.length === 0) {
    return fail("当前没有平票，不需要决胜轮", 409);
  }

  const until = new Date(Date.now() + RUNOFF_WINDOW_MS);

  await prisma.$transaction([
    // 决胜轮从零开始，只保留平票选项，避免上一轮的非平票票继续计入。
    prisma.vote.deleteMany({ where: { participant: { activityId: activity.id } } }),
    prisma.activity.update({
      where: { id: activity.id },
      data: {
        tieBreakOptionIds: JSON.stringify(tiedIds),
        tieBreakUntil: until,
        deadline: until,
      },
    }),
  ]);

  publish(activity.shareCode);
  return ok({
    tieBreak: {
      optionIds: tiedIds,
      until: until.toISOString(),
    },
    deadline: until.toISOString(),
  });
}
