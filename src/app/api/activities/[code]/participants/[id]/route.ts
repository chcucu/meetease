import { NextRequest } from "next/server";
import { fail, ok, readBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { getSessionUserFromRequest } from "@/lib/session";
import { paymentSchema } from "@/lib/validation";

type Context = { params: Promise<{ code: string; id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const { code, id } = await context.params;
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code.toUpperCase() },
    select: { id: true, ownerId: true, shareCode: true },
  });
  if (!activity || activity.ownerId !== user.id) {
    return fail("活动不存在或无权操作", 404);
  }

  const data = await readBody(request, paymentSchema);
  if (data instanceof Response) return data;

  const participant = await prisma.participant.findFirst({
    where: { id, activityId: activity.id },
    select: { id: true },
  });
  if (!participant) return fail("参与者不存在", 404);

  await prisma.participant.update({
    where: { id: participant.id },
    data: { paid: data.paid, paidAt: data.paid ? new Date() : null },
  });

  publish(activity.shareCode);
  return ok({ paid: data.paid });
}
