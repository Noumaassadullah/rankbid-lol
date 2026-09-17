'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

interface DailySnapshot {
  date: string;
  listings: Array<{
    id: string;
    title: string;
    url: string;
    amount: number;
    rank: number;
  }>;
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
      // Generate dates for past 30 days
      const dates = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - i);
        date.setUTCHours(0, 0, 0, 0);
        dates.push(date.toISOString().split('T')[0]);
      }

      // In a real implementation, you would fetch actual snapshots from the database
      // For now, we'll create sample snapshots based on current data
      const res = await fetch('/api/listings/submit?limit=100');
      if (res.ok) {
        const data = await res.json();
        const listings = data.listings || [];

        const mockSnapshots: DailySnapshot[] = dates.map((date, idx) => ({
          date,
          listings: listings.slice(0, 10).map((listing: any, rank: number) => ({
            id: listing.id,
            title: listing.title,
            url: listing.url,
            amount: listing.dayPaid || 0,
            rank: rank + 1,
          })),
        }));

        setSnapshots(mockSnapshots);
        if (mockSnapshots.length > 0) {
          setSelectedDate(mockSnapshots[0].date);
        }
      }
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedSnapshot = snapshots.find(s => s.date === selectedDate);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Daily Rankings Archive</h1>
          <p className="text-gray-600 mb-12">View historical daily rankings from the past 30 days</p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Date Selector */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[600px] overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4">Select Date</h3>
                <div className="space-y-2">
                  {snapshots.map((snapshot) => (
                    <button
                      key={snapshot.date}
                      onClick={() => setSelectedDate(snapshot.date)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        selectedDate === snapshot.date
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {formatDate(snapshot.date)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Snapshot Display */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12 text-gray-600">Loading archives...</div>
              ) : !selectedSnapshot || selectedSnapshot.listings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">No rankings for this date</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-900">
                      <span className="font-semibold">Archive Date:</span> {formatDate(selectedSnapshot.date)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedSnapshot.listings.map((listing, idx) => (
                      <a
                        key={listing.id}
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:border-orange-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-orange-600 w-10">#{idx + 1}</span>
                            <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                {listing.title}
                              </h3>
                              <p className="text-sm text-gray-500">{listing.url}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-orange-600">
                            ₨{(listing.amount / 100).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">That Day</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
