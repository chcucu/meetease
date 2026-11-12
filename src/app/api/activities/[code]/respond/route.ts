import { NextRequest } from "next/server";
import { fail, ok, readBody } from "@/lib/api";
import { getSnapshot } from "@/lib/activities";
import { prisma } from "@/lib/db";
import { publish } from "@/lib/realtime";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { respondSchema } from "@/lib/validation";

type Context = { params: Promise<{ code: string }> };

function isEmpty(value: string | string[] | undefined) {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.filter((item) => item.trim()).length === 0;
  return !value.trim();
}

export async function POST(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const data = await readBody(request, respondSchema);
  if (data instanceof Response) return data;

  const ip = clientIp(request);
  const limited = rateLimit(`respond:${ip}`, 12, 60_000);
  if (!limited.allowed) return tooManyRequests(limited.retryAfter);

  const captcha = await verifyTurnstile(data.turnstileToken, ip);
  if (!captcha.ok) return fail(captcha.error, 403);

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
  const optionsById = new Map(activity.options.map((option) => [option.id, option]));

  for (const id of optionIds) {
    if (!optionsById.has(id)) return fail("包含无效的选项", 422);
  }

  if (activity.voteType === "single") {
    const seenKinds = new Set<string>();
    for (const id of optionIds) {
      const kind = optionsById.get(id)!.kind;
      if (seenKinds.has(kind)) {
        return fail(kind === "time" ? "时间只能选一个" : "地点只能选一个", 422);
      }
      seenKinds.add(kind);
    }
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

  const participant = await prisma.participant.upsert({
    where: {
      activityId_clientKey: { activityId: activity.id, clientKey: data.clientKey },
    },
    create: {
      activityId: activity.id,
      clientKey: data.clientKey,
      name: data.name,
      answers: JSON.stringify(cleanAnswers),
    },
    update: {
      name: data.name,
      answers: JSON.stringify(cleanAnswers),
    },
    select: { id: true, name: true, paid: true, createdAt: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.vote.deleteMany({ where: { participantId: participant.id } });
    if (optionIds.length) {
      await tx.vote.createMany({
        data: optionIds.map((optionId) => ({ participantId: participant.id, optionId })),
      });
    }
  });

  publish(activity.shareCode);
  const snapshot = await getSnapshot(activity.shareCode);

  return ok({
    participant: {
      id: participant.id,
      name: participant.name,
      optionIds,
      answers: cleanAnswers,
    },
    snapshot,
  });
}
