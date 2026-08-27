import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const activity = await prisma.activity.findUnique({ where: { shareCode: code } });
  if (!activity) {
    return new Response("Activity not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let lastData = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          const [timeOptions, locationOptions, suggestions, participantCount, participants] = await Promise.all([
            prisma.timeOption.findMany({
              where: { activityId: activity.id },
              include: { _count: { select: { votes: true } } },
            }),
            prisma.locationOption.findMany({
              where: { activityId: activity.id },
              include: { _count: { select: { votes: true } } },
            }),
            prisma.suggestion.findMany({
              where: { activityId: activity.id },
              include: { _count: { select: { votes: true } } },
              orderBy: { createdAt: "desc" },
            }),
            prisma.participant.count({ where: { activityId: activity.id } }),
            prisma.participant.findMany({
              where: { activityId: activity.id },
              select: { id: true, name: true, paid: true, paidAt: true },
            }),
          ]);

          const paidCount = participants.filter((p) => p.paid).length;
          const unpaidCount = participants.filter((p) => !p.paid).length;

          const data = JSON.stringify({
            timeOptions,
            locationOptions,
            suggestions,
            participantCount,
            feeAmount: activity.feeAmount,
            feeDescription: activity.feeDescription,
            paidCount,
            unpaidCount,
            totalParticipants: participants.length,
            participants,
          });

          if (data !== lastData) {
            lastData = data;
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch (e) {
          // ignore polling errors
        }
      };

      // Send initial data
      await send();

      const interval = setInterval(send, 2000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}