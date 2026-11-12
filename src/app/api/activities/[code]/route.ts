import { NextRequest } from "next/server";
import { getActivityDetail, getActivityForOwner } from "@/lib/activities";
import { fail, ok, readBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { getSessionUserFromRequest } from "@/lib/session";
import { updateActivitySchema } from "@/lib/validation";

type Context = { params: Promise<{ code: string }> };

async function ownedActivity(code: string, userId: string) {
  return prisma.activity.findUnique({
    where: { shareCode: code, ownerId: userId },
    select: { id: true, ownerId: true, shareCode: true },
  });
}

export async function GET(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const normalized = code.toUpperCase();
  const key = request.nextUrl.searchParams.get("key");

  if (key) {
    const activity = await getActivityDetail(normalized, key);
    if (!activity) return fail("没有找到这个活动", 404);
    return ok({ activity });
  }

  const user = await getSessionUserFromRequest(request);
  if (user) {
    const owned = await getActivityForOwner(normalized, user.id);
    if (owned) return ok({ activity: owned });
  }

  const activity = await getActivityDetail(normalized);
  if (!activity) return fail("没有找到这个活动", 404);
  return ok({ activity });
}

export async function PATCH(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activity = await ownedActivity(code.toUpperCase(), user.id);
  if (!activity) return fail("活动不存在或无权操作", 404);

  const data = await readBody(request, updateActivitySchema);
  if (data instanceof Response) return data;

  const updated = await prisma.activity.update({
    where: { id: activity.id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.deadline !== undefined
        ? { deadline: data.deadline ? new Date(data.deadline) : null }
        : {}),
      ...(data.allowSuggestions !== undefined
        ? { allowSuggestions: data.allowSuggestions }
        : {}),
    },
    select: { status: true, deadline: true, allowSuggestions: true },
  });

  publish(activity.shareCode);
  return ok({
    activity: {
      status: updated.status,
      deadline: updated.deadline ? updated.deadline.toISOString() : null,
      allowSuggestions: updated.allowSuggestions,
    },
  });
}

export async function DELETE(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activity = await ownedActivity(code.toUpperCase(), user.id);
  if (!activity) return fail("活动不存在或无权操作", 404);

  await prisma.activity.delete({ where: { id: activity.id } });
  publish(activity.shareCode);
  return ok({});
}
