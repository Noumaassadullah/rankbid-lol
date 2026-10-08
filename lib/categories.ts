// Human-readable label for a stored category value.
// Known values map explicitly; anything else is split from CamelCase ("DigitalMarketing" -> "Digital Marketing").
const CATEGORY_LABELS: Record<string, string> = {
  AIMedia: 'AI Media',
  RealEstate: 'Real Estate',
  ECommerce: 'E-commerce',
  Ecommerce: 'E-commerce',
};

export function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return 'Other';
  return CATEGORY_LABELS[category] ?? category.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// Stored category values offered on the site, in display order.
export const CATEGORIES = ['Marketing', 'SEO', 'Productivity', 'Agents', 'Crypto', 'Developer', 'Health', 'Games', 'Business', 'Ecommerce', 'Travel', 'Directories', 'AIMedia', 'Agencies', 'Social', 'Education', 'People', 'Design', 'Hiring', 'Domains', 'Security', 'Sales', 'News', 'RealEstate', 'Writing', 'Audio', 'Analytics', 'Unlimited', 'Other'];

// Values found on older listings that the submit form no longer offers. They still get a
// category page so those listings' breadcrumbs resolve, but aren't shown in the category nav.
export const LEGACY_CATEGORIES = ['DigitalMarketing', 'Technology'];

/** URL slug for a stored category value: "AIMedia" -> "ai-media", "Ecommerce" -> "e-commerce". */
export function categorySlug(category: string): string {
  return getCategoryLabel(category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Stored category value for a slug (or a raw stored value, case-insensitive), or null if unknown. */
export function categoryFromSlug(slug: string): string | null {
  const s = slug.toLowerCase();
  return [...CATEGORIES, ...LEGACY_CATEGORIES].find(c => categorySlug(c) === s || c.toLowerCase() === s) ?? null;
}

/** Category page for a stored value; unknown values fall back to the categories hub instead of a 404. */
export function categoryPath(category: string): string {
  return categoryFromSlug(category) ? `/categories/${categorySlug(category)}` : '/categories';
}
