import { NextRequest } from "next/server";
import { fail, ok, readBody } from "@/lib/api";
import { getSnapshot } from "@/lib/activities";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { verifySlider } from "@/lib/slider-captcha";
import { respondSchema } from "@/lib/validation";

type Context = { params: Promise<{ code: string }> };

function isEmpty(value: string | string[] | undefined) {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.filter((item) => item.trim()).length === 0;
  return !value.trim();
}

function parseIds(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const data = await readBody(request, respondSchema);
  if (data instanceof Response) return data;

  const ip = clientIp(request);
  const limited = rateLimit(`respond:${ip}`, 12, 60_000);
  if (!limited.allowed) return tooManyRequests(limited.retryAfter);

  const captcha = await verifySlider(data.sliderToken, data.sliderX, ip);
  if (!captcha.ok) return fail(captcha.error ?? "人机验证未通过，请重新验证", 403);

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code.toUpperCase() },
    include: { options: true, fields: true },
  });
  if (!activity) return fail("没有找到这个活动", 404);
  if (activity.status !== "open") return fail("这次活动已经结束投票了", 409);
  if (activity.deadline && activity.deadline.getTime() < Date.now()) {
    return fail("已经过了截止时间", 409);
  }

  const optionIds = Array.from(new Set(data.optionIds));
  const vetoOptionIds = Array.from(new Set(data.vetoOptionIds));
  const optionsById = new Map(activity.options.map((option) => [option.id, option]));

  for (const id of [...optionIds, ...vetoOptionIds]) {
    if (!optionsById.has(id)) return fail("包含无效的选项", 422);
  }

  const tieBreakOptionIds = parseIds(activity.tieBreakOptionIds);
  if (
    tieBreakOptionIds.length > 0 &&
    activity.tieBreakUntil &&
    activity.tieBreakUntil.getTime() > Date.now()
  ) {
    const allowed = new Set(tieBreakOptionIds);
    if ([...optionIds, ...vetoOptionIds].some((id) => !allowed.has(id))) {
      return fail("决胜轮只接受平票选项", 422);
    }
  }

  // 同一选项既支持又否决时以否决为准。
  const vetoSet = new Set(vetoOptionIds);
  const supportIds = optionIds.filter((id) => !vetoSet.has(id));

  if (activity.voteType === "single") {
    const seenKinds = new Set<string>();
    for (const id of supportIds) {
      const kind = optionsById.get(id)!.kind;
      if (seenKinds.has(kind)) {
        return fail(kind === "time" ? "时间只能选一个" : "地点只能选一个", 422);
      }
      seenKinds.add(kind);
    }
  }

  const supportSet = new Set(supportIds);
  const rankedOptionIds = Array.from(new Set(data.rankedOptionIds)).filter((id) =>
    supportSet.has(id)
  );

  const condition = data.condition?.trim() ? data.condition.trim() : null;
  const conditionOptionId = data.conditionOptionId || null;
  if (Boolean(condition) !== Boolean(conditionOptionId)) {
    return fail("条件和条件选项需要同时填写", 422);
  }
  if (conditionOptionId && !optionsById.has(conditionOptionId)) {
    return fail("条件选项无效", 422);
  }

  const cleanAnswers: Record<string, string | string[]> = {};
  for (const field of activity.fields) {
    const raw = data.answers[field.id];
    const fieldOptions = field.options ? (JSON.parse(field.options) as string[]) : [];

    if (isEmpty(raw)) {
      if (field.required) return fail(`请填写「${field.label}」`, 422);
      continue;
    }

    if (field.type === "multi") {
      const values = Array.isArray(raw) ? raw : [raw];
      if (fieldOptions.length && values.some((value) => !fieldOptions.includes(value))) {
        return fail(`「${field.label}」包含无效选项`, 422);
      }
      cleanAnswers[field.id] = values.map((value) => value.trim()).filter(Boolean);
      continue;
    }

    const value = (Array.isArray(raw) ? raw[0] : raw).trim();
    if (field.type === "select" && fieldOptions.length && !fieldOptions.includes(value)) {
      return fail(`「${field.label}」包含无效选项`, 422);
    }
    if (field.type === "number" && Number.isNaN(Number(value))) {
      return fail(`「${field.label}」需要填写数字`, 422);
    }
    cleanAnswers[field.id] = value;
  }

  const rankById = new Map(rankedOptionIds.map((id, index) => [id, index + 1]));

  // D1 has no interactive transactions, so the write sequence is issued as
  // individual statements after re-checking that voting is still open.
  const current = await prisma.activity.findUnique({
    where: { id: activity.id },
    select: { status: true, deadline: true },
  });
  if (
    !current ||
    current.status !== "open" ||
    (current.deadline && current.deadline.getTime() < Date.now())
  ) {
    return fail("这次活动已经结束投票了", 409);
  }

  const participant = await prisma.participant.upsert({
    where: {
      activityId_clientKey: { activityId: activity.id, clientKey: data.clientKey },
    },
    create: {
      activityId: activity.id,
      clientKey: data.clientKey,
      name: data.name,
      answers: JSON.stringify(cleanAnswers),
      condition,
      conditionOptionId,
    },
    update: {
      name: data.name,
      answers: JSON.stringify(cleanAnswers),
      condition,
      conditionOptionId,
    },
    select: { id: true, name: true, paid: true, createdAt: true },
  });

  await prisma.vote.deleteMany({ where: { participantId: participant.id } });
  const votes = [
    ...supportIds.map((optionId) => ({
      participantId: participant.id,
      optionId,
      value: 1,
      rank: rankById.get(optionId) ?? 0,
    })),
    ...vetoOptionIds.map((optionId) => ({
      participantId: participant.id,
      optionId,
      value: -1,
      rank: 0,
    })),
  ];
  if (votes.length) {
    await prisma.vote.createMany({ data: votes });
  }

  publish(activity.shareCode);
  const snapshot = await getSnapshot(activity.shareCode);

  return ok({
    participant: {
      id: participant.id,
      name: participant.name,
      optionIds: supportIds,
      vetoOptionIds,
      rankedOptionIds,
      condition,
      conditionOptionId,
      answers: cleanAnswers,
    },
    snapshot,
  });
}
