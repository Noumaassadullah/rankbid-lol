'use client';

interface FAQProps {
  index: number;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}

// One FAQ row styled like the section heading: the open row is "selected" with a
// lavender highlight and a handle bar, and its answer slides open.
export default function FAQ({ index, question, answer, open, onToggle }: FAQProps) {
  const id = `faq-${index}`;

  return (
    <div className={`relative border-b border-[#0B2545]/10 transition-colors duration-300 ${open ? 'bg-[#CDD0E3]/45' : 'hover:bg-[#CDD0E3]/20'}`}>
      {/* Selection handle on the open row */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#3B4CCA] origin-top transition-transform duration-300 ${open ? 'scale-y-100' : 'scale-y-0'}`}
      >
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#3B4CCA]" />
      </span>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="group w-full flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-5 sm:py-6 text-left"
      >
        <span className={`text-xs sm:text-sm font-bold tabular-nums transition-colors ${open ? 'text-[#3B4CCA]' : 'text-[#0B2545]/35'}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={`flex-1 text-base sm:text-lg font-semibold tracking-[-0.01em] transition-colors ${open ? 'text-[#0B2545]' : 'text-[#0B2545]/80 group-hover:text-[#0B2545]'}`}>
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`relative w-9 h-9 flex-shrink-0 rounded-full border transition-all duration-300 ${
            open ? 'bg-[#3B4CCA] border-[#3B4CCA] text-white rotate-45' : 'border-[#0B2545]/15 text-[#0B2545] group-hover:border-[#3B4CCA]'
          }`}
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-[2px] rounded-full bg-current" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-3.5 rounded-full bg-current" />
        </span>
      </button>

      {/* Animates height by transitioning the grid row from 0fr to 1fr */}
      <div
        id={id}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="pl-[3.25rem] sm:pl-[4.25rem] pr-16 sm:pr-20 pb-6 text-sm sm:text-[15px] leading-relaxed text-[#1F2937]/70">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
