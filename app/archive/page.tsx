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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch('/api/daily-snapshots?daysBack=30');
      if (res.ok) {
        const data = await res.json();
        const fetchedSnapshots = data.snapshots || [];

        setSnapshots(fetchedSnapshots);
        if (fetchedSnapshots.length > 0) {
          const firstDate = fetchedSnapshots[0].date;
          const dateStr = typeof firstDate === 'string' ? firstDate : new Date(firstDate).toISOString().split('T')[0];
          setSelectedDate(dateStr);
        }
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
      // If it's an ISO string with time, use it directly; otherwise add time
      if (dateStr.includes('T')) {
        date = new Date(dateStr);
      } else {
        date = new Date(dateStr + 'T00:00:00Z');
      }
    } else {
      date = new Date(dateStr);
    }

    // Check if date is valid
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

  const selectedSnapshot = snapshots.find(s => {
    const snapshotDate = typeof s.date === 'string' ? s.date : new Date(s.date).toISOString().split('T')[0];
    return snapshotDate === selectedDate;
  });

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">
        {/* Header Section */}
        <section className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl font-black text-[#1F2937] mb-2">Rankings Archive</h1>
            <p className="text-[#1F2937]/70 font-semibold">View historical daily rankings from the past 30 days</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Date Selector */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 bg-gray-50 p-4 border-3 border-gray-300 max-h-[600px] overflow-y-auto rounded-lg">
                  <h3 className="font-black text-[#1F2937] mb-4 text-sm">Select Date</h3>
                  <div className="space-y-2">
                    {snapshots.map((snapshot) => {
                      const dateStr = typeof snapshot.date === 'string' ? snapshot.date : new Date(snapshot.date).toISOString().split('T')[0];
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`w-full text-left px-4 py-3 transition-all text-sm font-bold border-2 rounded-lg ${
                            selectedDate === dateStr
                              ? 'bg-[#0F3460] text-white border-[#0F3460]'
                              : 'text-[#1F2937] border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {formatDate(snapshot.date)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Snapshot Display */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin text-4xl">⏳</div>
                    <p className="text-[#1F2937]/60 font-semibold mt-2">Loading archives...</p>
                  </div>
                ) : !selectedSnapshot || !selectedSnapshot.data || selectedSnapshot.data.length === 0 ? (
                  <div className="text-center py-12 border-gray-300 border-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-[#1F2937]">No rankings for this date</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 p-6 bg-gray-50 border-3 border-gray-300 rounded-lg">
                      <p className="text-sm font-black text-[#1F2937]">
                        Archive Date: {formatDate(selectedSnapshot.date)}
                      </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {selectedSnapshot.data.map((item, idx) => {
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
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md hover:border-[#0F3460]/30 transition-all duration-200 group cursor-pointer gap-4"
                          >
                            {/* Left Section: Position Badge and Favicon */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-9 h-9 bg-[#0F3460] text-white font-black text-xs rounded-lg flex items-center justify-center flex-shrink-0">
                                #{item.rank}
                              </div>
                              <img src={faviconUrl} alt="favicon" className="w-6 h-6 rounded flex-shrink-0" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'; }} />

                              {/* Title */}
                              <p className="text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#0F3460] transition-colors flex-1 min-w-0">
                                {item.listing.title}
                              </p>
                            </div>

                            {/* Right Section: Vote Count and Actions */}
                            <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                              {/* Vote Count */}
                              <p className="text-lg font-black text-[#0F3460] min-w-[1.5rem] text-right">
                                {item.votes}
                              </p>

                              {/* Action Buttons */}
                              <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => e.preventDefault()}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1 whitespace-nowrap bg-white border border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white`}
                                >
                                  <Icons.Heart />
                                  Vote
                                </button>

                                <button
                                  onClick={(e) => e.preventDefault()}
                                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-orange-300 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                                >
                                  📤 Share
                                </button>

                                <button
                                  onClick={(e) => e.preventDefault()}
                                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                                >
                                  ⭐ Premium
                                </button>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
