'use client';

import { useState } from 'react';

interface FAQProps {
  question: string;
  answer: string;
}

export default function FAQ({ question, answer }: FAQProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-300 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors gap-3"
      >
        <h3 className="font-semibold text-15px text-[#1F2937] text-left">{question}</h3>
        <svg className={`w-5 h-5 text-[#0F3460] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-[#1F2937] leading-relaxed text-15px font-normal">{answer}</p>
        </div>
      )}
    </div>
  );
}
