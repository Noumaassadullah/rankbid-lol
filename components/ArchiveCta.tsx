import Link from 'next/link';

// Cut-out (transparent WebP) of a person holding out a phone showing RankBid's
// home page. It stands on the bottom of the panel and rises above its top edge.
const PERSON_SRC = '/archive-person.webp';

// Closing call-to-action for the archive page: copy on the left, the person
// with the phone on the right.
export default function ArchiveCta() {
  return (
    <section className="relative overflow-hidden bg-gray-50 border-t border-gray-200 pt-12 md:pt-48 lg:pt-36 pb-12 sm:pb-16 md:pb-20">
      {/* Thin decorative arcs behind the panel */}
      <div className="pointer-events-none absolute -left-40 top-24 h-[36rem] w-[36rem] rounded-full border border-[#0F3460]/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-48 h-[34rem] w-[34rem] rounded-full border border-[#0F3460]/10" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="spotlight relative flow-root rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#0F3460] to-[#1a5490] text-white">
          {/* Tablet: person centred, rising out of the top of the panel, the cut-off legs
              fading into the navy. Hidden on phones, which get the copy only. flow-root on the panel keeps the negative margin on
              the image instead of collapsing through to the panel. */}
          <img
            src={PERSON_SRC}
            alt=""
            aria-hidden="true"
            className="hidden md:block lg:hidden mx-auto -mt-40 h-96 w-auto"
            style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent)' }}
          />

          <div className="grid lg:grid-cols-[3fr_2fr] items-center">
            {/* COPY */}
            <div className="relative z-10 px-6 pt-10 md:pt-6 pb-10 sm:px-10 sm:pb-14 lg:py-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight">
                Today’s launch is
                <span className="block text-emerald-300">tomorrow’s archive</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed max-w-md">
                Every product in this archive started with one submission. Launch yours free, collect real votes, and earn your place in RankBid history.
              </p>
              <Link
                href="/#submit"
                className="mt-8 inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-[#0F3460] font-black text-sm rounded-xl shadow-lg shadow-black/20 hover:-translate-y-0.5 transition-all"
              >
                Submit your product →
              </Link>
            </div>

            {/* Desktop: person standing on the bottom of the panel, rising above its top */}
            <div className="relative hidden lg:block h-full min-h-[360px]" aria-hidden="true">
              <img
                src={PERSON_SRC}
                alt=""
                className="absolute bottom-0 right-4 h-[calc(100%+9rem)] w-auto max-w-none drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
