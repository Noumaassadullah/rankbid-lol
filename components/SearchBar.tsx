'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Search"
      >
        🔍
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 z-50">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
          {query && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="block mt-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-center hover:bg-orange-600 transition-colors"
            >
              Search
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
