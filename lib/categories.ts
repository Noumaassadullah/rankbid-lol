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
