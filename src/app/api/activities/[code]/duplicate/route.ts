import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { generateShareCode } from "@/lib/codes";
import { getSessionUserFromRequest } from "@/lib/session";

type Context = { params: Promise<{ code: string }> };

export async function POST(request: NextRequest, context: Context) {
  const { code } = await context.params;
  const user = await getSessionUserFromRequest(request);
  if (!user) return fail("请先登录", 401);

  const activity = await prisma.activity.findUnique({
    where: { shareCode: code.toUpperCase(), ownerId: user.id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      fields: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!activity) return fail("活动不存在或无权操作", 404);

  for (let attempt = 0; attempt < 6; attempt++) {
    const shareCode = generateShareCode();
    const existing = await prisma.activity.findUnique({
      where: { shareCode },
      select: { id: true },
    });
    if (existing) continue;

    const title = (activity.title + "（副本）").slice(0, 80);

    try {
      const copy = await prisma.activity.create({
        data: {
          shareCode,
          ownerId: user.id,
          title,
          description: activity.description,
          category: activity.category,
          voteType: activity.voteType,
          allowSuggestions: activity.allowSuggestions,
          coverTheme: activity.coverTheme,
          coverImage: activity.coverImage,
          timeZone: activity.timeZone,
          locationName: activity.locationName,
          locationAddress: activity.locationAddress,
          locationLat: activity.locationLat,
          locationLng: activity.locationLng,
          feeAmount: activity.feeAmount,
          feeNote: activity.feeNote,
          deadline:
            activity.deadline && activity.deadline.getTime() > Date.now()
              ? activity.deadline
              : null,
          options: {
            create: activity.options.map((option) => ({
              kind: option.kind,
              label: option.label,
              note: option.note,
              startsAt: option.startsAt,
              endsAt: option.endsAt,
              lat: option.lat,
              lng: option.lng,
              sortOrder: option.sortOrder,
            })),
          },
          fields: {
            create: activity.fields.map((field) => ({
              label: field.label,
              type: field.type,
              required: field.required,
              options: field.options,
              placeholder: field.placeholder,
              sortOrder: field.sortOrder,
            })),
          },
        },
        select: { shareCode: true },
      });

      return ok({ code: copy.shareCode });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        continue;
      }
      throw error;
    }
  }

  return fail("生成分享码失败，请稍后重试", 500);
}
