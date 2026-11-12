import { NextRequest } from "next/server";
import { createActivity, getOwnerActivities } from "@/lib/activities";
import { fail, ok, readBody } from "@/lib/api";
import { getSessionUserFromRequest } from "@/lib/session";
import { createActivitySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activities = await getOwnerActivities(user.id);
  return ok({ activities });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const data = await readBody(request, createActivitySchema);
  if (data instanceof Response) return data;

  if (!data.options.some((option) => option.kind === "time")) {
    return fail("至少添加一个时间选项", 422);
  }

  const activity = await createActivity(user.id, data);
  return ok({ code: activity.shareCode, id: activity.id }, 201);
}
