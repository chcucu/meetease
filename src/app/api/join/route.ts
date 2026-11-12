import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const limit = rateLimit(`join:${ip}`, 20, 60_000);
  if (!limit.allowed) return tooManyRequests(limit.retryAfter);

  const code = (request.nextUrl.searchParams.get("code") ?? "").replace(/\s+/g, "");
  if (!/^\d{4}$/.test(code) && !/^[A-Za-z0-9]{6}$/.test(code)) {
    return fail("请输入 4 位数字口令", 400);
  }

  try {
    const byJoinCode = await prisma.activity.findFirst({
      where: { joinCode: code },
      select: { shareCode: true, title: true },
    });
    if (byJoinCode) return ok(byJoinCode);

    const byShareCode = await prisma.activity.findUnique({
      where: { shareCode: code.toUpperCase() },
      select: { shareCode: true, title: true },
    });
    if (byShareCode) return ok(byShareCode);
  } catch {
    return fail("查询失败，请稍后重试", 500);
  }

  return fail("没有找到这个口令对应的决策", 404);
}
