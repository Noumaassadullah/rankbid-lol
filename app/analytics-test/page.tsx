import { AnalyticsWidget } from '@/components/analytics-widget';

export default function AnalyticsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Live Analytics Dashboard</h1>
          <p className="text-gray-600">
            This page shows real visitor tracking data from your Supabase database.
          </p>
        </div>

        <AnalyticsWidget />

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🔧 Setup Status</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-blue-900">Step 1: Apply RLS Changes</h3>
              <p className="text-gray-600 mt-2">
                Go to your Supabase Dashboard {'>'} SQL Editor and run:
              </p>
              <pre className="bg-gray-100 p-4 rounded mt-3 text-sm overflow-x-auto">
{`ALTER TABLE visitor_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics DISABLE ROW LEVEL SECURITY;`}
              </pre>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-green-900">Step 2: Start Tracking</h3>
              <p className="text-gray-600 mt-2">
                The tracker is now active. Just visit your site in multiple tabs/browsers.
              </p>
              <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
                <li>VisitorTracker starts on page load</li>
                <li>Automatically refreshes every 5 minutes</li>
                <li>Check browser console for logs: [CLIENT], [TRACKING], [LIVE VIEWERS], [STATS]</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-purple-900">Step 3: Monitor in Real-Time</h3>
              <p className="text-gray-600 mt-2">
                Analytics update automatically every 10 seconds.
              </p>
              <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
                <li>Watch this page refresh with real data</li>
                <li>Try opening in another tab/browser</li>
                <li>Numbers should increase immediately</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-900 mb-2">💡 Testing Tips</h3>
          <ol className="list-decimal list-inside text-yellow-800 space-y-2">
            <li>Open browser DevTools (F12) and go to Console</li>
            <li>Look for logs starting with [CLIENT], [TRACKING], [WIDGET]</li>
            <li>Each log shows what's being tracked</li>
            <li>Open this page in 2-3 tabs to see live viewers increase</li>
            <li>Wait 30+ seconds and watch the analytics update</li>
          </ol>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-2">🎯 Expected Behavior</h3>
          <ul className="list-disc list-inside text-green-800 space-y-2">
            <li><strong>Live Now:</strong> Shows number of active sessions in last 30 min</li>
            <li><strong>Today:</strong> Visitors that came today</li>
            <li><strong>Total:</strong> All visitors (all time)</li>
            <li><strong>Views:</strong> Total page views (all time)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
