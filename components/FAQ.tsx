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
        className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-sm text-[#1F2937] text-left">{question}</h3>
        <span className={`font-bold text-lg text-[#0F3460] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-[#1F2937] leading-relaxed text-sm">{answer}</p>
        </div>
      )}
    </div>
  );
}
