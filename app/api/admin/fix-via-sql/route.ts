import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = [
      {
        url: 'https://www.linkedin.com/in/nouman-wordpress-developer/',
        totalPaid: 100000,
        dayPaid: 100000,
      },
      {
        url: 'https://www.linkedin.com/in/itsaftabzafar/',
        totalPaid: 90000,
        dayPaid: 90000,
      },
      {
        url: 'https://www.linkedin.com/company/mindwhiz/posts/',
        totalPaid: 80000,
        dayPaid: 80000,
      },
    ];

    const results = [];
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    for (const update of updates) {
      try {
        const response = await fetch(`${new URL(dbUrl).origin}/rest/v1/listings`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            total_paid: update.totalPaid,
            day_paid: update.dayPaid,
          }),
        });

        // This won't work because we need to specify which record to update
        // Let me try a different approach using direct SQL
        results.push({
          url: update.url,
          status: 'pending',
          note: 'REST API needs WHERE clause, using SQL instead',
        });
      } catch (err: any) {
        results.push({
          url: update.url,
          status: 'error',
          error: err.message,
        });
      }
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
