import { NextRequest } from "next/server";
import { fail } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/session";

type Context = { params: Promise<{ code: string }> };

function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function parseAnswers(raw: string | null): Record<string, string | string[]> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string | string[]>;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest, context: Context) {
  const { code: rawCode } = await context.params;
  const code = rawCode.toUpperCase();
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code },
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      options: { orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] },
      participants: {
        orderBy: { createdAt: "asc" },
        include: {
          votes: { include: { option: true } },
          suggestionVotes: { include: { suggestion: true } },
        },
      },
    },
  });

  if (!activity || activity.ownerId !== user.id) {
    return fail("活动不存在或无权操作", 404);
  }

  const header = [
    "姓名",
    "支付状态",
    "参与时间",
    "时间选择",
    "地点选择",
    ...activity.fields.map((field) => field.label),
    "附议",
  ];

  const rows = activity.participants.map((participant) => {
    const answers = parseAnswers(participant.answers);
    const timePicks = participant.votes
      .filter((vote) => vote.option.kind === "time")
      .map((vote) => vote.option.label);
    const placePicks = participant.votes
      .filter((vote) => vote.option.kind === "place")
      .map((vote) => vote.option.label);

    return [
      participant.name,
      participant.paid ? "已支付" : "未支付",
      participant.createdAt.toISOString(),
      timePicks.join(" / "),
      placePicks.join(" / "),
      ...activity.fields.map((field) => {
        const value = answers[field.id];
        return Array.isArray(value) ? value.join(" / ") : (value ?? "");
      }),
      participant.suggestionVotes.map((vote) => vote.suggestion.content).join(" / "),
    ].map(cell);
  });

  const csv = `\uFEFF${[header.map(cell), ...rows].map((row) => row.join(",")).join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quorum-${code}.csv"; filename*=UTF-8''quorum-${code}.csv`,
      "Cache-Control": "no-store",
    },
  });
}
