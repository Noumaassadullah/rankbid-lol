import { NextRequest, NextResponse } from 'next/server';
import { getLiveSnapshot, isAdminRequest } from '@/lib/server/admin';

// Server-Sent Events feed for the admin dashboard. The server checks the database every few
// seconds and pushes a `snapshot` event whenever submissions, votes or rankings change.
// The stream closes itself before the function time limit; EventSource reconnects on its own.

export const maxDuration = 300;

const POLL_MS = 3000;
const STREAM_MS = 280_000;
const HEARTBEAT_MS = 15_000;

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const encoder = new TextEncoder();
  const started = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let lastPayload = '';
      let lastSent = 0;

      const close = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch {}
      };
      req.signal.addEventListener('abort', close);

      const send = (chunk: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(chunk));
        lastSent = Date.now();
      };

      // Ask the browser to wait 1s before reconnecting after we close.
      send('retry: 1000\n\n');

      while (!closed && Date.now() - started < STREAM_MS) {
        try {
          const snapshot = await getLiveSnapshot();
          // generatedAt changes every poll; compare the data alone so we only push real changes.
          const { generatedAt, ...data } = snapshot;
          const payload = JSON.stringify(data);
          if (payload !== lastPayload) {
            lastPayload = payload;
            send(`event: snapshot\ndata: ${JSON.stringify({ generatedAt, ...data })}\n\n`);
          } else if (Date.now() - lastSent > HEARTBEAT_MS) {
            send(`event: ping\ndata: ${JSON.stringify({ generatedAt })}\n\n`);
          }
        } catch (error) {
          console.error('Admin live snapshot failed:', error);
          send(`event: error-message\ndata: ${JSON.stringify({ error: 'Failed to load live data' })}\n\n`);
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }
      close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
