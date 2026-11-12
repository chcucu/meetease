import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeCode } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type Context = { params: Promise<{ code: string }> };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE = "public, max-age=30, s-maxage=60, stale-while-revalidate=120";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest, context: Context) {
  const ip = clientIp(request);
  const limited = rateLimit(`api:v1:${ip}`, 60, 60_000);
  if (!limited.allowed) {
    return Response.json(
      { ok: false, error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: { ...CORS, "Retry-After": String(limited.retryAfter) },
      }
    );
  }

  const { code } = await context.params;
  const shareCode = normalizeCode(code);

  const activity = await prisma.activity.findUnique({
    where: { shareCode },
    select: {
      shareCode: true,
      title: true,
      status: true,
      voteType: true,
      timeZone: true,
      deadline: true,
      createdAt: true,
      options: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          kind: true,
          label: true,
          votes: { select: { value: true } },
        },
      },
      _count: { select: { participants: true, suggestions: true } },
    },
  });

  if (!activity) {
    return Response.json(
      { ok: false, error: "没有找到这个活动" },
      { status: 404, headers: { ...CORS, "Cache-Control": "no-store" } }
    );
  }

  const options = activity.options.map((option) => ({
    id: option.id,
    kind: option.kind,
    label: option.label,
    votes: option.votes.filter((vote) => vote.value === 1).length,
  }));

  return Response.json(
    {
      ok: true,
      activity: {
        shareCode: activity.shareCode,
        title: activity.title,
        status: activity.status,
        voteType: activity.voteType,
        timeZone: activity.timeZone,
        deadline: activity.deadline?.toISOString() ?? null,
        createdAt: activity.createdAt.toISOString(),
      },
      counts: {
        participants: activity._count.participants,
        votes: options.reduce((sum, option) => sum + option.votes, 0),
        suggestions: activity._count.suggestions,
      },
      options,
      meta: {
        generatedAt: new Date().toISOString(),
        cacheSeconds: 60,
        privacy: "aggregate-only",
      },
    },
    {
      headers: {
        ...CORS,
        "Cache-Control": CACHE,
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
