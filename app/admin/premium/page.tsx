'use client';

import { useState, useEffect } from 'react';
import { Trash2, Check, X, ChevronDown, AlertCircle, DollarSign } from 'lucide-react';

interface PremiumListing {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_description: string;
  category: string;
  total_votes: number;
  day_votes: number;
  premium_position: number;
  founder_name: string;
  founder_email: string;
  founder_phone: string;
  payment_status: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

const POSITION_PRICES: Record<number, number> = {
  1: 5,
  2: 3,
  3: 1
};

export default function PremiumAdmin() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [premiumListings, setPremiumListings] = useState<PremiumListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
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
    fetchPremiumListings('pending');
  };

  const fetchPremiumListings = async (status: string) => {
    setLoading(true);
    try {
      const key = localStorage.getItem('admin_key') || adminKey;
      const res = await fetch(`/api/admin/premium-listings?status=${status}`, {
        headers: { 'x-admin-key': key }
      });

      if (res.ok) {
        const data = await res.json();
        setPremiumListings(data.premiumListings);
      } else {
        showToast('Failed to fetch premium listings', 'error');
      }
    } catch (error) {
      showToast('Error fetching premium listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (premiumListingId: string) => {
    try {
      const key = localStorage.getItem('admin_key') || adminKey;
      const res = await fetch('/api/admin/premium-listings', {
        method: 'PATCH',
        headers: {
          'x-admin-key': key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          premiumListingId,
          status: 'approved',
          approvedBy: 'admin'
        })
      });

      if (res.ok) {
        showToast('Premium listing approved!', 'success');
        fetchPremiumListings(filter);
      } else {
        showToast('Failed to approve', 'error');
      }
    } catch (error) {
      showToast('Error approving listing', 'error');
    }
  };

  const handleReject = async (premiumListingId: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      const key = localStorage.getItem('admin_key') || adminKey;
      const res = await fetch('/api/admin/premium-listings', {
        method: 'PATCH',
        headers: {
          'x-admin-key': key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          premiumListingId,
          status: 'rejected',
          approvedBy: 'admin'
        })
      });

      if (res.ok) {
        showToast('Premium listing rejected', 'success');
        fetchPremiumListings(filter);
      } else {
        showToast('Failed to reject', 'error');
      }
    } catch (error) {
      showToast('Error rejecting listing', 'error');
    }
  };

  useEffect(() => {
    const key = localStorage.getItem('admin_key');
    if (key) {
      setAdminKey(key);
      setIsAuthenticated(true);
      fetchPremiumListings('pending');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_key');
    setIsAuthenticated(false);
    setAdminKey('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F3460] to-[#1a5490] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-black text-[#1F2937] mb-2">Premium Admin</h1>
          <p className="text-[#1F2937]/60 mb-6">Enter your admin key</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#1F2937] mb-2">Admin Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460]"
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#0F3460] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black">💎 Premium Listings</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filter Buttons */}
        <div className="flex gap-4 mb-6">
          {['pending', 'approved', 'all'].map(f => (
            <button
              key={f}
              onClick={() => {
                setFilter(f as any);
                fetchPremiumListings(f === 'all' ? '' : f);
              }}
              className={`px-6 py-3 font-bold rounded-lg transition-colors ${
                filter === f
                  ? 'bg-[#0F3460] text-white'
                  : 'bg-white text-[#1F2937] hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Premium Listings Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading premium listings...</p>
          </div>
        ) : premiumListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No premium listings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {premiumListings.map(listing => (
              <div key={listing.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Listing Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0F3460] to-[#1a5490] rounded-lg flex items-center justify-center text-white font-black">
                        #{listing.premium_position}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1F2937]">{listing.listing_title}</h3>
                        <p className="text-sm text-[#1F2937]/70 mt-1">{listing.listing_description}</p>
                        <div className="flex gap-4 mt-3 flex-wrap text-xs">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {listing.category}
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            {listing.total_votes} votes
                          </span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {listing.day_votes} today
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Founder Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-2">Founder Information</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-bold">Name:</span> {listing.founder_name}</p>
                        <p><span className="font-bold">Email:</span> {listing.founder_email}</p>
                        <p><span className="font-bold">Phone:</span> {listing.founder_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="md:border-l border-gray-200 md:pl-6">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-2">Price</p>
                      <p className="text-3xl font-black text-[#0F3460]">
                        ${POSITION_PRICES[listing.premium_position] || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Position #{listing.premium_position}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-600 uppercase mb-2">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-lg font-bold text-xs ${
                        listing.payment_status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : listing.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {listing.payment_status.toUpperCase()}
                      </span>
                    </div>

                    {listing.payment_status === 'pending' && (
                      <div className="flex gap-2 flex-col">
                        <button
                          onClick={() => handleApprove(listing.id)}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(listing.id)}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {listing.approved_at && (
                      <div className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-200">
                        <p>Approved by: {listing.approved_by}</p>
                        <p>On: {new Date(listing.approved_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
