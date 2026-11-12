import { NextRequest } from "next/server";
import { fail, ok, readBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { getSessionUserFromRequest } from "@/lib/session";
import { addOptionSchema } from "@/lib/validation";

type Context = { params: Promise<{ code: string }> };

export async function POST(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code.toUpperCase(), ownerId: user.id },
    select: { id: true, shareCode: true },
  });
  if (!activity) return fail("活动不存在或无权操作", 404);

  const data = await readBody(request, addOptionSchema);
  if (data instanceof Response) return data;

  if (data.kind === "time" && !data.startsAt) {
    return fail("时间选项需要填写开始时间", 422);
  }
  if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
    return fail("结束时间需要晚于开始时间", 422);
  }

  const last = await prisma.pollOption.findFirst({
    where: { activityId: activity.id, kind: data.kind },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const option = await prisma.pollOption.create({
    data: {
      activityId: activity.id,
      kind: data.kind,
      label: data.label,
      note: data.note,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
    select: { id: true },
  });

  publish(activity.shareCode);
  return ok({ option });
}
