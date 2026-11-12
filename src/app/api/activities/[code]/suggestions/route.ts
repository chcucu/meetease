import { NextRequest } from "next/server";
import { fail, ok, readBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { suggestionSchema } from "@/lib/validation";

type Context = { params: Promise<{ code: string }> };

export async function POST(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const data = await readBody(request, suggestionSchema);
  if (data instanceof Response) return data;

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code.toUpperCase() },
    select: {
      id: true,
      shareCode: true,
      status: true,
      deadline: true,
      allowSuggestions: true,
    },
  });
  if (!activity) return fail("没有找到这个活动", 404);
  if (!activity.allowSuggestions) return fail("这个活动没有开放提议", 403);
  if (activity.status !== "open") return fail("这次活动已经结束投票了", 409);
  if (activity.deadline && activity.deadline.getTime() < Date.now()) {
    return fail("已经过了截止时间", 409);
  }

  const suggestion = await prisma.suggestion.create({
    data: {
      activityId: activity.id,
      content: data.content,
      authorName: data.authorName,
      kind: data.kind,
    },
  });

  publish(activity.shareCode);

  return ok(
    {
      suggestion: {
        id: suggestion.id,
        content: suggestion.content,
        authorName: suggestion.authorName,
        kind: suggestion.kind,
        createdAt: suggestion.createdAt.toISOString(),
        votes: 0,
        upvoted: false,
      },
    },
    201
  );
}
