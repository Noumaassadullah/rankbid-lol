import { trackVisitor } from '@/lib/visitor-tracking';
import { NextRequest, NextResponse } from 'next/server';
import { ipHash } from '@/lib/server/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 100) : '';
    const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl.slice(0, 500) : '';
    if (!sessionId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const userAgent = (request.headers.get('user-agent') || '').slice(0, 300);
    // A salted hash, not the raw IP: enough to tell visitors apart, without storing personal data.
    const ipAddress = ipHash(request);

    const result = await trackVisitor(sessionId, userAgent, ipAddress, pageUrl);

    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
