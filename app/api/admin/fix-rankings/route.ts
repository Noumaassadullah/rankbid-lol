import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Security: Check for admin key
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        const updated = await prisma.listing.update({
          where: { url: profile.url },
          data: {
            totalPaid: profile.totalPaid,
            dayPaid: profile.dayPaid,
          },
        });
        results.push({ url: profile.url, status: 'updated', title: updated.title });
      } catch (err: any) {
        if (err.code === 'P2025') {
          // Record not found, create it
          const created = await prisma.listing.create({
            data: {
              url: profile.url,
              title: profile.url.split('/').pop() || 'LinkedIn Profile',
              description: 'LinkedIn Profile',
              category: 'Technology',
              platform: 'linkedin',
              ...profile,
            },
          });
          results.push({ url: profile.url, status: 'created', title: created.title });
        } else {
          results.push({ url: profile.url, status: 'error', error: err.message });
        }
      }
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error('Error fixing rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fix rankings' },
      { status: 500 }
    );
  }
}
