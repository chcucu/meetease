import { NextRequest } from "next/server";
import { fail } from "@/lib/api";
import { getSnapshot } from "@/lib/activities";
import { subscribe } from "@/lib/realtime";

type Context = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: Context) {
  const { code: rawCode } = await context.params;
  const code = rawCode.toUpperCase();
  const initial = await getSnapshot(code);
  if (!initial) return fail("没有找到这个活动", 404);

  const encoder = new TextEncoder();
  let closed = false;
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let lastPayload = "";
      let sending = false;

      const write = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const sendSnapshot = (snapshot: unknown) => {
        const payload = JSON.stringify(snapshot);
        if (payload === lastPayload) return;
        lastPayload = payload;
        write(`event: snapshot\ndata: ${payload}\n\n`);
      };

      const refresh = async () => {
        if (sending || closed) return;
        sending = true;
        try {
          const snapshot = await getSnapshot(code);
          if (snapshot) sendSnapshot(snapshot);
        } catch {
          // Keep the stream alive; the next tick can recover.
        } finally {
          sending = false;
        }
      };

      const unsubscribe = subscribe(code, () => {
        void refresh();
      });
      const poll = setInterval(() => void refresh(), 10000);
      const heartbeat = setInterval(() => write(": quorum\n\n"), 20000);

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(poll);
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      };

      request.signal.addEventListener("abort", cleanup);
      write(`retry: 3000\n\n`);
      sendSnapshot(initial);

      if (request.signal.aborted) cleanup();
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
