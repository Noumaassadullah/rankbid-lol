import type { MetadataRoute } from 'next';
import { CATEGORIES, categoryPath } from '@/lib/categories';
import { getRankedListings } from '@/lib/server/listings';
import { absoluteUrl } from '@/lib/seo';

// Only pages that are public before launch (see PUBLIC_PAGES in proxy.ts). Gated pages
// redirect crawlers to /coming-soon, so listing them here would only report redirects.
const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'hourly' },
  { path: '/categories', priority: 0.9, changeFrequency: 'daily' },
  { path: '/why', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/platforms', priority: 0.7, changeFrequency: 'daily' },
  { path: '/rules', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/tos', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getRankedListings();
  const now = new Date();

  return [
    ...STATIC_PAGES.map(p => ({ url: absoluteUrl(p.path), lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority })),
    ...CATEGORIES.map(c => ({ url: absoluteUrl(categoryPath(c)), lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...listings.map(l => ({ url: absoluteUrl(`/product/${l.id}`), lastModified: new Date(l.updatedAt), changeFrequency: 'daily' as const, priority: 0.6 })),
  ];
}
