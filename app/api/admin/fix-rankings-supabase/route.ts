import { createClient } from '@supabase/supabase-js';
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

    const supabase = createClient(supabaseUrl, supabaseKey);

    const linkedinProfiles = [
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
    for (const profile of linkedinProfiles) {
      try {
        // Try to update
        const { data: existing, error: selectErr } = await supabase
          .from('listings')
          .select('id')
          .eq('url', profile.url)
          .single();

        if (existing) {
          // Update existing
          const { error: updateErr } = await supabase
            .from('listings')
            .update({
              totalPaid: profile.totalPaid,
              dayPaid: profile.dayPaid,
            })
            .eq('url', profile.url);

          if (updateErr) throw updateErr;
          results.push({ url: profile.url, status: 'updated' });
        } else {
          // Create new
          const { error: insertErr } = await supabase
            .from('listings')
            .insert([
              {
                url: profile.url,
                title: profile.url.split('/').filter(Boolean).pop() || 'Profile',
                description: 'LinkedIn Profile',
                category: 'Technology',
                platform: 'linkedin',
                totalPaid: profile.totalPaid,
                dayPaid: profile.dayPaid,
              },
            ]);

          if (insertErr) throw insertErr;
          results.push({ url: profile.url, status: 'created' });
        }
      } catch (err: any) {
        results.push({ url: profile.url, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix rankings' },
      { status: 500 }
    );
  }
}
