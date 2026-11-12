import { NextRequest } from "next/server";
import { getActivityDetail } from "@/lib/activities";
import { fail } from "@/lib/api";
import { buildCalendarFile, calendarFileName } from "@/lib/ics";

type Context = { params: Promise<{ code: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const normalized = code.toUpperCase();
  const optionId = request.nextUrl.searchParams.get("option");

  if (!optionId) return fail("缺少选项参数", 400);

  const activity = await getActivityDetail(normalized);
  if (!activity) return fail("没有找到这个活动", 404);

  const option = activity.options.find((item) => item.id === optionId);
  if (!option || option.kind !== "time" || !option.startsAt) {
    return fail("这个选项没有可导出的时间", 404);
  }

  const file = buildCalendarFile({
    code: activity.shareCode,
    title: activity.title,
    description: activity.description,
    location:
      activity.location?.address ||
      activity.location?.name ||
      null,
    option,
    origin: request.nextUrl.origin,
  });

  return new Response(file, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${calendarFileName(activity.shareCode)}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
