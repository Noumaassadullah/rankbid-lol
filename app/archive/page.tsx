'use client';

import Header from '@/components/Header';
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
    const date = typeof dateStr === 'string' ? new Date(dateStr + 'T00:00:00Z') : new Date(dateStr);
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
                <div className="sticky top-20 bg-gray-50 p-4 border-3 border-gray-300 max-h-[600px] overflow-y-auto">
                  <h3 className="font-black text-[#1F2937] mb-4 text-sm">Select Date</h3>
                  <div className="space-y-2">
                    {snapshots.map((snapshot) => {
                      const dateStr = typeof snapshot.date === 'string' ? snapshot.date : new Date(snapshot.date).toISOString().split('T')[0];
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`w-full text-left px-4 py-3 transition-all text-sm font-bold border-2 ${
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
                  <div className="text-center py-12 border-gray-300 border-4 bg-gray-50">
                    <p className="text-sm font-bold text-[#1F2937]">No rankings for this date</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 p-6 bg-gray-50 border-3 border-gray-300">
                      <p className="text-sm font-black text-[#1F2937]">
                        Archive Date: {formatDate(selectedSnapshot.date)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {selectedSnapshot.data.map((item) => (
                        <a
                          key={item.listing.id}
                          href={item.listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white border-gray-300 border-3 hover:bg-[#0F3460]/10 hover:scale-101 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-[#0F3460] text-white font-black rounded-lg flex items-center justify-center text-sm">
                              #{item.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#1F2937] truncate">{item.listing.title}</p>
                              <p className="text-xs text-[#1F2937]/60 mt-1 truncate">{item.listing.url}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-2xl font-black text-[#0F3460]">♥ {item.votes}</p>
                            <p className="text-xs text-[#1F2937]/60 font-semibold">Votes</p>
                          </div>
                        </a>
                      ))}
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
