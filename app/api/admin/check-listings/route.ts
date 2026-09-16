import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const linkedinUrls = [
      'https://www.linkedin.com/in/nouman-wordpress-developer/',
      'https://www.linkedin.com/in/itsaftabzafar/',
      'https://www.linkedin.com/company/mindwhiz/posts/',
    ];

    const listings = await prisma.listing.findMany({
      where: {
        url: { in: linkedinUrls },
      },
    });

    return NextResponse.json({
      count: listings.length,
      listings: listings.map((l) => ({
        url: l.url,
        title: l.title,
        totalPaid: l.totalPaid,
        dayPaid: l.dayPaid,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
