'use client';

import { useState } from 'react';

interface FAQProps {
  question: string;
  answer: string;
}

export default function FAQ({ question, answer }: FAQProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-3 border-[#18181B] bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F5F5F4] transition-colors"
      >
        <h3 className="font-semibold text-sm text-[#18181B] text-left uppercase tracking-wide">{question}</h3>
        <span className={`font-black text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t-3 border-[#18181B] bg-[#F5F5F4]">
          <p className="text-[#18181B] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
