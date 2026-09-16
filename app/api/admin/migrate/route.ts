import { execSync } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This will only work if DATABASE_URL is set in the environment
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    try {
      const output = execSync('npx prisma migrate deploy', {
        encoding: 'utf-8',
        stdio: 'pipe',
        env: { ...process.env },
      });

      return NextResponse.json({
        success: true,
        message: 'Migrations applied successfully',
        output,
      });
    } catch (err: any) {
      // Migration might have already been applied - check if tables exist
      return NextResponse.json({
        success: false,
        error: err.message || 'Migration failed',
        stderr: err.stderr?.toString(),
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to run migrations' },
      { status: 500 }
    );
  }
}
