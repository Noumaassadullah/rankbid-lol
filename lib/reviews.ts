// Reviews shown in the homepage "trusted by makers" section.
// Only add real reviews you have permission to publish: the person's own words, name and product.
// When the list is empty the section shows a "share your experience" card instead.

export interface Review {
  quote: string;
  name: string;
  /** Their role or product, e.g. "Founder, MindWhiz" */
  role: string;
  /** Optional link to their listing, e.g. "/product/abc123" */
  href?: string;
  /** 1–5 */
  rating?: number;
  /** Optional photo of the reviewer (with their permission); replaces an orbit face in the same slot. */
  avatar?: string;
}

export const REVIEWS: Review[] = [];
