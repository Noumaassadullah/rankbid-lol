import { CATEGORIES } from '@/lib/categories';

// Single source for FAQ copy: the homepage accordion, /faq (with FAQPage schema) and llms.txt.
// Each answer opens with a direct, self-contained sentence and names RankBid instead of
// using pronouns, so search snippets and AI answers can quote it on its own.
export const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is RankBid?',
    a: 'RankBid is a free product launch and discovery platform where the community votes and the most-voted products rise to the top of a live leaderboard. Makers submit websites, apps or creator profiles, and rankings are decided by votes, not algorithms or ad budgets.',
  },
  {
    q: 'Is RankBid free to use?',
    a: 'Yes. Submitting a product and voting on RankBid are both 100% free, with no listing fees and no limit on how many products you submit. Premium listings are an optional extra and are never required to rank.',
  },
  {
    q: 'How does voting work on RankBid?',
    a: 'Each person gets one vote per product on RankBid. Logged-in members vote from any listing, and anyone else can vote through a product’s shareable support link with just a name and email, no account needed. Vote counts are public and update in real time.',
  },
  {
    q: 'How are rankings determined?',
    a: 'RankBid ranks products by total community votes, highest first. When two products have the same number of votes, the product that reached that count most recently ranks higher. The all-time leaderboard never resets.',
  },
  {
    q: 'What is the difference between all-time and today’s rankings?',
    a: 'The all-time RankBid leaderboard uses every vote a product has ever received. The Today board only counts votes from the last 24 hours, so new launches can trend quickly. Each day’s top products are saved to the Archive.',
  },
  {
    q: 'What can I submit to RankBid?',
    a: 'You can submit any live website, app or creator profile on X (Twitter), LinkedIn, Instagram, TikTok or Facebook. The listing needs a working URL, an accurate title and description, and the best-fitting category. One listing per product, no duplicates.',
  },
  {
    q: 'How do I get more votes for my product?',
    a: 'Share your product’s support link. Every RankBid listing has a public support link plus one-click sharing to WhatsApp, X and LinkedIn and a downloadable rank card. Friends, customers and followers can vote in about 10 seconds without creating an account.',
  },
  {
    q: 'What are premium listings?',
    a: 'Premium listings are optional paid placements that feature a product in the #1, #2 or #3 spot on RankBid for 30 days. Spots start at $5, $3 and $1; anyone who pays at least $1 more than the current holder takes the spot, and the holder moves down one. Free listings rank on votes alone, and premium listings follow the same content rules as everyone else.',
  },
  {
    q: 'Can I buy or trade votes?',
    a: 'No. RankBid bans fake accounts, bots, vote buying and vote trading. Any attempt to manipulate rankings gets the listing removed and the account banned, which keeps the leaderboard an honest signal of what people like.',
  },
  {
    q: 'What categories does RankBid have?',
    a: `RankBid has ${CATEGORIES.length} categories, including Marketing, SEO, Productivity, Agents, Crypto, Developer, Design, AI Media, E-commerce, Health, Education and Business. Each category has its own live leaderboard.`,
  },
  {
    q: 'Is RankBid an alternative to Product Hunt?',
    a: 'Yes. RankBid is a free product launch platform like Product Hunt, built around one rule: the public vote count decides the rank. Every listing goes live without an editorial queue, and makers can collect votes from people who don’t have an account.',
  },
  {
    q: 'How do I remove or edit my submission?',
    a: 'Email the RankBid support team and they will update or remove your listing, usually within a day. You can see everything you have submitted and voted for on your profile page.',
  },
];
