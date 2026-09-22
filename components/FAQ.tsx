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
        <span className={`font-bold text-sm text-[#0F3460] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-[#1F2937] leading-relaxed text-15px font-normal">{answer}</p>
        </div>
      )}
    </div>
  );
}
