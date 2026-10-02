'use client';

import Header from '@/components/Header';
import PlatformIcon from '@/components/PlatformIcon';
import { useState, useEffect } from 'react';

interface SnapshotListing {
  rank: number;
  listing: {
    id: string;
    title: string;
    url: string;
  };
  votes: number;
}

interface DailySnapshot {
  id: string;
  date: string;
  data: SnapshotListing[];
  frozen: boolean;
}

const Icons = {
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

export default function ArchivePage() {
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch('/api/daily-snapshots?daysBack=90');
      if (res.ok) {
        const data = await res.json();
        const fetchedSnapshots = data.snapshots || [];
        setSnapshots(fetchedSnapshots);
      }
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    let date: Date;
    if (typeof dateStr === 'string') {
      if (dateStr.includes('T')) {
        date = new Date(dateStr);
      } else {
        date = new Date(dateStr + 'T00:00:00Z');
      }
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSnapshotsForMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return snapshots.filter(s => {
      const snapshotDate = new Date(s.date + 'T00:00:00Z');
      return snapshotDate.getFullYear() === year && snapshotDate.getMonth() === month;
    }).sort((a, b) => {
      return new Date(b.date + 'T00:00:00Z').getTime() - new Date(a.date + 'T00:00:00Z').getTime();
    });
  };

  const monthSnapshots = getSnapshotsForMonth(selectedMonth);

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">
        {/* Header Section */}
        <section className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl font-black text-[#1F2937] mb-2">Rankings Archive</h1>
            <p className="text-[#1F2937]/70 font-semibold">View all historical daily rankings and submission positions</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 border-3 border-gray-300 rounded-lg">
              <button
                onClick={() => {
                  const prev = new Date(selectedMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setSelectedMonth(prev);
                }}
                className="px-4 py-2 bg-[#0F3460] text-white font-bold rounded-lg hover:opacity-90"
              >
                ← Previous Month
              </button>

              <h2 className="text-2xl font-black text-[#1F2937]">
                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>

              <button
                onClick={() => {
                  const next = new Date(selectedMonth);
                  next.setMonth(next.getMonth() + 1);
                  setSelectedMonth(next);
                }}
                className="px-4 py-2 bg-[#0F3460] text-white font-bold rounded-lg hover:opacity-90"
              >
                Next Month →
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl">⏳</div>
                <p className="text-[#1F2937]/60 font-semibold mt-2">Loading archives...</p>
              </div>
            ) : monthSnapshots.length === 0 ? (
              <div className="text-center py-12 border-gray-300 border-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-bold text-[#1F2937]">No rankings data for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {monthSnapshots.map((snapshot) => (
                  <div key={snapshot.id} className="border-3 border-gray-300 rounded-lg overflow-hidden">
                    {/* Date Header */}
                    <div className="bg-[#0F3460] text-white px-6 py-4">
                      <h3 className="text-xl font-black">
                        {formatDate(snapshot.date)}
                      </h3>
                      <p className="text-sm font-semibold text-blue-100 mt-1">
                        {snapshot.data?.length || 0} submissions ranked
                      </p>
                    </div>

                    {/* Rankings List */}
                    <div className="bg-white">
                      {!snapshot.data || snapshot.data.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <p>No submissions for this date</p>
                        </div>
                      ) : (
                        <div className="space-y-2 p-4">
                          {snapshot.data.map((item) => {
                            let faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                            try {
                              const urlObj = new URL(item.listing.url);
                              faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`;
                            } catch {
                              // If URL parsing fails, use placeholder
                            }

                            return (
                              <a
                                key={item.listing.id}
                                href={item.listing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-[#0F3460]/30 transition-all duration-200 group cursor-pointer gap-4 rounded-lg"
                              >
                                {/* Left: Rank Badge and Title */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-[#0F3460] text-white font-black text-xs rounded flex items-center justify-center flex-shrink-0">
                                    #{item.rank}
                                  </div>
                                  <img src={faviconUrl} alt="favicon" className="w-5 h-5 rounded flex-shrink-0" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'; }} />
                                  <p className="text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#0F3460] transition-colors flex-1 min-w-0">
                                    {item.listing.title}
                                  </p>
                                </div>

                                {/* Right: Votes */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <p className="text-sm font-black text-[#0F3460] min-w-[2rem] text-right">
                                    {item.votes} votes
                                  </p>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
