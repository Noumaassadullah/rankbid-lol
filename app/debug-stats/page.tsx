'use client';

import { useState, useEffect } from 'react';

export default function DebugStats() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [trackingStatus, setTrackingStatus] = useState<string>('');

  useEffect(() => {
    const testTracking = async () => {
      try {
        console.log('🔍 Starting debug...');

        // Step 1: Try to track a visitor
        console.log('📍 Tracking visitor...');
        const sessionId = `test-session-${Date.now()}`;
        const trackRes = await fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl: '/debug-stats',
          }),
        });

        console.log('Track Response:', trackRes.status, trackRes.statusText);
        const trackData = await trackRes.json();
        console.log('Track Data:', trackData);
        setTrackingStatus(JSON.stringify(trackData, null, 2));

        // Step 2: Fetch stats
        console.log('📊 Fetching stats...');
        const statsRes = await fetch('/api/stats');
        console.log('Stats Response:', statsRes.status, statsRes.statusText);
        const statsData = await statsRes.json();
        console.log('Stats Data:', statsData);
        setDbData(statsData);

        if (!statsRes.ok) {
          setError(`API Error: ${statsData.error}`);
        }
      } catch (err: any) {
        console.error('❌ Debug error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testTracking();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔍 Debug Stats</h1>

        {loading ? (
          <div className="text-lg">Loading...</div>
        ) : (
          <>
            {error && (
              <div className="bg-red-900 p-4 rounded mb-8 border border-red-700">
                <h2 className="text-red-400 font-bold mb-2">❌ Error</h2>
                <pre className="text-sm overflow-x-auto">{error}</pre>
              </div>
            )}

            <div className="space-y-8">
              <div className="bg-gray-800 p-6 rounded border border-gray-700">
                <h2 className="text-xl font-bold mb-4">✅ Tracking Status</h2>
                <pre className="text-sm bg-gray-900 p-4 rounded overflow-x-auto">
                  {trackingStatus}
                </pre>
              </div>

              <div className="bg-gray-800 p-6 rounded border border-gray-700">
                <h2 className="text-xl font-bold mb-4">📊 Current Stats</h2>
                {dbData ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                      <span>Online Now:</span>
                      <span className="text-green-400 text-2xl font-bold">
                        {dbData.onlineNow}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                      <span>Today Visitors:</span>
                      <span className="text-blue-400 text-2xl font-bold">
                        {dbData.todayVisitors}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded">
                      <span>All Time Visitors:</span>
                      <span className="text-purple-400 text-2xl font-bold">
                        {dbData.allTimeVisitors}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No data</p>
                )}
              </div>

              <div className="bg-blue-900 p-6 rounded border border-blue-700">
                <h2 className="text-xl font-bold mb-4">💡 What to Check</h2>
                <ul className="space-y-2 text-sm">
                  <li>✓ If "Tracking Status" shows success: true → API is working</li>
                  <li>✓ If "Online Now" shows 0 → Check if visitor_sessions table has data</li>
                  <li>✓ Open F12 Console to see logs starting with 🔍</li>
                  <li>✓ If error appears → Check Supabase credentials</li>
                </ul>
              </div>

              <div className="bg-yellow-900 p-6 rounded border border-yellow-700">
                <h2 className="text-xl font-bold mb-4">🚀 Next: Test in Supabase</h2>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Go to Supabase Dashboard</li>
                  <li>Click "SQL Editor"</li>
                  <li>Run: <code className="bg-gray-900 px-2 py-1 rounded">SELECT * FROM visitor_sessions;</code></li>
                  <li>Should see at least 1 row with the data you just tracked</li>
                </ol>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
