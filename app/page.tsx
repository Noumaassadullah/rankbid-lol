import HomePage from '@/components/HomePage';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, pageMetadata } from '@/lib/seo';

export const metadata = {
  ...pageMetadata({ title: `${SITE_NAME}: ${SITE_TAGLINE}`, description: SITE_DESCRIPTION, path: '/' }),
  // The homepage title is the full brand line, not "... | RankBid".
  title: { absolute: `${SITE_NAME}: ${SITE_TAGLINE}` },
};

export default function Page() {
  return <HomePage />;
}
