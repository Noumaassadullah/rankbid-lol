import SelectionHeading from '@/components/SelectionHeading';
import { REVIEWS } from '@/lib/reviews';
import { SUPPORT_EMAIL } from '@/lib/site';

interface TrustedByProps {
  products: number;
  votes: number;
  categories: number;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? '' : 'opacity-25'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

/** "Trusted by makers": illustration, live platform numbers, and real reviews from lib/reviews.ts. */
export default function TrustedBy({ products, votes, categories }: TrustedByProps) {
  const stats = [
    { value: products, label: 'products listed' },
    { value: votes, label: 'community votes' },
    { value: categories, label: 'categories ranked' },
  ];

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-white border-t border-gray-200 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-16 items-end mb-10 sm:mb-12">
          <SelectionHeading
            lead="trusted by"
            highlight="makers"
            sub="Founders, agencies and creators launch here and let real votes do the talking."
          />
          {/* Live numbers from the platform */}
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {stats.map(s => (
              <div key={s.label}>
                <dd className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#0B2545] tabular-nums">
                  {s.value ? s.value.toLocaleString() : '—'}
                </dd>
                <dt className="text-xs sm:text-sm text-[#1F2937]/55 mt-1">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <img
          src="/trusted-makers.png"
          alt="Makers who launch their products on RankBid"
          width={1600}
          height={776}
          loading="lazy"
          className="w-full h-auto"
        />

        {/* Reviews */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {REVIEWS.map(r => (
            <figure key={r.name + r.role} className="relative pl-5">
              <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#059669]">
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#059669]" />
              </span>
              {r.rating ? <Stars rating={r.rating} /> : null}
              <blockquote className="mt-3 text-base sm:text-lg text-[#0B2545] leading-relaxed tracking-[-0.01em]">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-bold text-[#0B2545]">{r.name}</span>
                <span className="text-[#1F2937]/55"> · {r.href ? <a href={r.href} className="hover:text-[#0F3460] underline-offset-2 hover:underline">{r.role}</a> : r.role}</span>
              </figcaption>
            </figure>
          ))}

          {/* Invite makers to leave a review (always last; the only card while there are none) */}
          <div className={`relative pl-5 ${REVIEWS.length === 0 ? 'md:col-span-2 lg:col-span-3 max-w-2xl' : ''}`}>
            <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#0F3460]/15" />
            <p className="text-base sm:text-lg text-[#0B2545] leading-relaxed tracking-[-0.01em]">
              Launched on RankBid? Tell us how it went and your review could appear here.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('My RankBid review')}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F3460] hover:underline underline-offset-2"
            >
              Share your experience →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
