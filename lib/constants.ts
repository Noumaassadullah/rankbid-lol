// Minimum and maximum amounts
export const MIN_LISTING_AMOUNT_CENTS = 50000; // Rs. 500
export const MIN_OUTRANK_AMOUNT_CENTS = 50000; // Rs. 500 more required
export const MAX_LISTING_AMOUNT_CENTS = 99999900; // Rs. 999,999

// Time windows
export const ROLLING_24H_MS = 24 * 60 * 60 * 1000;
export const DAILY_SNAPSHOT_TIME = '00:00'; // UTC midnight

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 1000;

// Categories
export const CATEGORIES = [
  'All',
  'Leaderboards',
  'SEO',
  'Marketing',
  'Productivity',
  'Agents',
  'Crypto',
  'Other',
  'Developer',
  'AI',
  'SaaS',
  'Analytics',
  'Tools',
  'Education',
  'Entertainment',
  'Finance',
  'Health',
  'Lifestyle',
  'News',
  'Shopping',
  'Social',
  'Travel',
  'Video',
  'Business',
] as const;

// Payment methods
export const PAYMENT_METHODS = ['jazzcash', 'easypaisa', 'stripe'] as const;

// URLs that are blocked
export const BLOCKED_DOMAINS = [
  'pornhub.com',
  'xvideos.com',
  'onlyfans.com',
  't.me',
  'telegram.me',
  'discord.gg',
  'discord.com/invite',
  'whatsapp.com/invite',
  'wa.me',
];

// Pagination helpers
export const createPaginationMeta = (total: number, page: number, pageSize: number) => ({
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize),
  hasNextPage: page < Math.ceil(total / pageSize),
  hasPrevPage: page > 1,
});
