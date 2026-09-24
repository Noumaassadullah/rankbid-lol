import { trackVisitor } from '@/lib/visitor-tracking';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, pageUrl } = await request.json();

    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    console.log(`[TRACKING] Session: ${sessionId}, Page: ${pageUrl}, IP: ${ipAddress}`);

    const result = await trackVisitor(sessionId, userAgent, ipAddress, pageUrl);

    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
