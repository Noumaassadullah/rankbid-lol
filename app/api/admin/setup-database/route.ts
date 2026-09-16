import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const linkedinProfiles = [
      {
        id: 'nouman-profile',
        url: 'https://www.linkedin.com/in/nouman-wordpress-developer/',
        title: 'Nouman - WordPress Developer',
        description: 'LinkedIn Profile - Nouman',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 100000,
        dayPaid: 100000,
      },
      {
        id: 'aftab-profile',
        url: 'https://www.linkedin.com/in/itsaftabzafar/',
        title: 'Aftab Zafar - Software Engineer',
        description: 'LinkedIn Profile - Aftab Zafar',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 90000,
        dayPaid: 90000,
      },
      {
        id: 'mindwhiz-profile',
        url: 'https://www.linkedin.com/company/mindwhiz/posts/',
        title: 'MindWhiz - Tech Company',
        description: 'LinkedIn Company - MindWhiz',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 80000,
        dayPaid: 80000,
      },
    ];

    const results = [];

    for (const profile of linkedinProfiles) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/listings`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              id: profile.id,
              url: profile.url,
              title: profile.title,
              description: profile.description,
              category: profile.category,
              platform: profile.platform,
              totalPaid: profile.totalPaid,
              dayPaid: profile.dayPaid,
              clickCount: 0,
              createdAt: new Date().toISOString(),
              lastRaisedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          results.push({
            url: profile.url,
            status: 'error',
            error: data.message || 'Failed to insert',
          });
        } else {
          results.push({
            url: profile.url,
            status: 'created',
            id: profile.id,
          });
        }
      } catch (err: any) {
        results.push({
          url: profile.url,
          status: 'error',
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup complete',
      results,
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}
