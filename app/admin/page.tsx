'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, Edit, Eye, ChevronDown, Search, Plus, AlertCircle, TrendingUp, Users, FileText, Zap } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalListings: number;
  totalVotes: number;
  premiumListings: {
    total: number;
    approved: number;
    pending: number;
  };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  total_votes: number;
  day_votes: number;
  click_count: number;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  vote_count: number;
  session_count: number;
}

const COLORS = ['#0F3460', '#059669', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'premium' | 'moderation'>('overview');

  const [stats, setStats] = useState<Stats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  const [listingsPage, setListingsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);

  const showToast = (message: string, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin_key', adminKey);
    setIsAuthenticated(true);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const key = localStorage.getItem('admin_key') || adminKey;
      const headers = { 'x-admin-key': key };

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) {
        const data = await statsRes.json();
        console.log('Stats data:', data);
        setStats(data.stats);
        setCategoryData(data.categoryBreakdown || []);
        setDailyStats(data.dailyStats || []);
      } else {
        console.error('Stats error:', statsRes.status);
        showToast('Failed to fetch stats', 'error');
      }

      // Fetch listings
      const listingsRes = await fetch(`/api/admin/listings?page=${listingsPage}&limit=20&search=${encodeURIComponent(searchQuery)}`, { headers });
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(data.listings || []);
      } else {
        console.error('Listings error:', listingsRes.status);
      }

      // Fetch users
      const usersRes = await fetch(`/api/admin/users?page=${usersPage}&limit=20&search=${encodeURIComponent(searchQuery)}`, { headers });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      } else {
        console.error('Users error:', usersRes.status);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const key = localStorage.getItem('admin_key');
    if (key) {
      setAdminKey(key);
      setIsAuthenticated(true);
      fetchAllData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab !== 'overview') {
      fetchAllData();
    }
  }, [activeTab, listingsPage, usersPage, searchQuery]);

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const key = localStorage.getItem('admin_key') || adminKey;
      const res = await fetch('/api/admin/listings', {
        method: 'DELETE',
        headers: { 'x-admin-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      });

      if (res.ok) {
        showToast('Listing deleted successfully', 'success');
        fetchAllData();
      } else {
        showToast('Failed to delete listing', 'error');
      }
    } catch (error) {
      showToast('Error deleting listing', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const key = localStorage.getItem('admin_key') || adminKey;
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'x-admin-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        showToast('User deleted successfully', 'success');
        fetchAllData();
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('Error deleting user', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_key');
    setIsAuthenticated(false);
    setAdminKey('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F3460] to-[#1a5490] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-black text-[#1F2937] mb-2">Admin Access</h1>
          <p className="text-[#1F2937]/60 mb-6">Enter your admin key to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#1F2937] mb-2">Admin Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460] text-[#1F2937]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#0F3460] text-white font-bold rounded-lg hover:bg-[#0D2A50] transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="text-xs text-[#1F2937]/50 mt-4 text-center">
            Admin key is stored securely in your browser session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#0F3460] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black">🛡️ Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'listings', 'users', 'premium', 'moderation'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#0F3460] text-white'
                  : 'bg-white text-[#1F2937] hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-black text-[#0F3460]">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Listings</p>
                    <p className="text-3xl font-black text-[#0F3460]">{stats?.totalListings || 0}</p>
                  </div>
                  <FileText className="w-12 h-12 text-green-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Votes</p>
                    <p className="text-3xl font-black text-[#0F3460]">{stats?.totalVotes || 0}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Premium Listings</p>
                    <p className="text-3xl font-black text-[#0F3460]">{stats?.premiumListings.total || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats?.premiumListings.approved || 0} approved
                    </p>
                  </div>
                  <Zap className="w-12 h-12 text-yellow-200" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-[#1F2937] mb-4">Votes (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="votes" stroke="#0F3460" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-[#1F2937] mb-4">Listings by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setListingsPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[#1F2937]">Title</th>
                      <th className="px-4 py-3 text-left font-bold text-[#1F2937]">Category</th>
                      <th className="px-4 py-3 text-center font-bold text-[#1F2937]">Total Votes</th>
                      <th className="px-4 py-3 text-center font-bold text-[#1F2937]">Day Votes</th>
                      <th className="px-4 py-3 text-center font-bold text-[#1F2937]">Clicks</th>
                      <th className="px-4 py-3 text-center font-bold text-[#1F2937]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(listing => (
                      <tr key={listing.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-[#1F2937]">{listing.title}</td>
                        <td className="px-4 py-3 text-[#1F2937]/70">{listing.category}</td>
                        <td className="px-4 py-3 text-center font-bold text-[#0F3460]">{listing.total_votes}</td>
                        <td className="px-4 py-3 text-center text-[#1F2937]">{listing.day_votes}</td>
                        <td className="px-4 py-3 text-center text-[#1F2937]">{listing.click_count}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {listings.length === 0 && (
                <p className="text-center text-gray-500 py-8">No listings found</p>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setUsersPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[#1F2937]">Email</th>
                      <th className="px-4 py-3 text-left font-bold text-[#1F2937]">Name</th>
                      <th className="px-4 py-3 text-center font-bold text-[#1F2937]">Votes</th>
                      <th className="px-4 py-3 text-center font-bold text-[#1F2937]">Sessions</th>
                      <th className="px-4 py-3 text-left font-bold text-[#1F2937]">Joined</th>
                      <th className="px-4 py-3 text-center font-bold text-[#1F2937]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-[#1F2937]">{user.email}</td>
                        <td className="px-4 py-3 text-[#1F2937]">{user.name || '—'}</td>
                        <td className="px-4 py-3 text-center font-bold">{user.vote_count}</td>
                        <td className="px-4 py-3 text-center">{user.session_count}</td>
                        <td className="px-4 py-3 text-[#1F2937]/70">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <p className="text-center text-gray-500 py-8">No users found</p>
              )}
            </div>
          </div>
        )}

        {/* PREMIUM TAB */}
        {activeTab === 'premium' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Premium Listings Management</h3>
            <p className="text-gray-600 mb-6">
              Manage premium listing requests and approvals. Pending requests: {stats?.premiumListings.pending}
            </p>
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Premium listings management panel coming soon</p>
            </div>
          </div>
        )}

        {/* MODERATION TAB */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Moderation Tools</h3>
            <p className="text-gray-600 mb-6">Monitor suspicious activity and manage content moderation</p>
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Advanced moderation tools coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg font-bold text-sm animate-in fade-in ${
              toast.type === 'success'
                ? 'bg-green-100 text-green-700'
                : toast.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
