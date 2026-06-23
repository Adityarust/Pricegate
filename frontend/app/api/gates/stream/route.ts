import { fetchGates } from "@/lib/gates";

export const runtime = "nodejs";

const encoder = new TextEncoder();

function sseFrame(data: string): Uint8Array {
  return encoder.encode(`data: ${data}\n\n`);
}

export async function GET(request: Request) {
  const { signal } = request;

  let closed = false;
  let previousPayload = "";
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        if (closed || signal.aborted) return;

        try {
          const gates = await fetchGates();
          const payload = JSON.stringify(gates);
          if (payload !== previousPayload) {
            previousPayload = payload;
            controller.enqueue(sseFrame(payload));
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to load gates.";
          controller.enqueue(sseFrame(JSON.stringify({ error: message })));
        }
      };

      void send();
      refreshTimer = setInterval(() => {
        void send();
      }, 5_000);
      heartbeatTimer = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15_000);

      signal.addEventListener("abort", () => {
        closed = true;
        if (refreshTimer) clearInterval(refreshTimer);
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        controller.close();
      });
    },
    cancel() {
      closed = true;
      if (refreshTimer) clearInterval(refreshTimer);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
