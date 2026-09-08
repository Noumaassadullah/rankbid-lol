import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, handle, description, category } = await req.json();

    if (!url && !handle) {
      return NextResponse.json(
        { error: 'URL or handle required' },
        { status: 400 }
      );
    }

    if (!description || !category) {
      return NextResponse.json(
        { error: 'Description and category required' },
        { status: 400 }
      );
    }

    const normalizedUrl = url || `https://twitter.com/${handle}`;

    let listing = await prisma.listing.findUnique({
      where: { url: normalizedUrl },
    });

    if (listing) {
      return NextResponse.json(
        { listing, isNew: false }
      );
    }

    listing = await prisma.listing.create({
      data: {
        url: normalizedUrl,
        handle: handle || undefined,
        title: description.split('\n')[0].slice(0, 100),
        description,
        category: (category as any) || 'Other',
        totalPaid: 0,
        dayPaid: 0,
        clickCount: 0,
      },
    });

    return NextResponse.json(
      { listing, isNew: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const sort = searchParams.get('sort') || 'totalPaid';

    if (url) {
      const listing = await prisma.listing.findUnique({
        where: { url },
        include: {
          payments: {
            where: { status: 'completed' },
            orderBy: { paidAt: 'desc' },
          },
        },
      });
      return NextResponse.json({ listing });
    }

    const where: any = {};
    if (category && category !== 'All') {
      where.category = category;
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: sort === 'dayPaid'
        ? { dayPaid: 'desc' }
        : { totalPaid: 'desc' },
      take: limit,
      include: {
        payments: {
          where: { status: 'completed' },
          select: { amount: true, paidAt: true },
          orderBy: { paidAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
