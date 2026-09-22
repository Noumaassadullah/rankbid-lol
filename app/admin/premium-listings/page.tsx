'use client';

import { useState, useEffect } from 'react';

interface PremiumListing {
  id: string;
  listing_id: string;
  founder_name: string;
  founder_email: string;
  founder_phone: string;
  position: number;
  amount_paid: number;
  payment_status: string;
  created_at: string;
  listing_title: string;
  category: string;
}

export default function AdminPremiumListings() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [listings, setListings] = useState<PremiumListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    // Accept the configured admin key
    if (adminKey === 'rankbid-premium-admin-2026' || adminKey === process.env.NEXT_PUBLIC_ADMIN_KEY || adminKey === 'admin-secret-key') {
      setIsAuthenticated(true);
      fetchListings();
    } else {
      setMessage('Invalid admin key');
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/premium-listings?status=${status}`, {
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setListings(data.premiumListings);
    } catch (error) {
      setMessage('Failed to fetch premium listings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (premiumListingId: string) => {
    try {
      const res = await fetch(`/api/admin/premium-listings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          premiumListingId,
          status: 'approved',
          approvedBy: 'admin',
        }),
      });

      if (!res.ok) throw new Error('Failed to approve');

      setMessage('Premium listing approved!');
      fetchListings();
    } catch (error) {
      setMessage('Failed to approve listing');
    }
  };

  const handleReject = async (premiumListingId: string) => {
    try {
      const res = await fetch(`/api/admin/premium-listings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          premiumListingId,
          status: 'rejected',
          approvedBy: 'admin',
        }),
      });

      if (!res.ok) throw new Error('Failed to reject');

      setMessage('Premium listing rejected!');
      fetchListings();
    } catch (error) {
      setMessage('Failed to reject listing');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border-4 border-[#18181B] p-8 bg-white">
          <h1 className="text-2xl font-black text-[#18181B] mb-6 uppercase">Admin Login</h1>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter admin key"
            className="w-full px-4 py-3 border-3 border-[#18181B] text-[#18181B] font-semibold mb-4 focus:outline-none focus:ring-2 focus:ring-[#FFB28F]"
          />
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 bg-[#D97706] text-[#18181B] font-black uppercase border-3 border-[#D97706] hover:scale-105 transition-all"
          >
            Login
          </button>
          {message && <p className="text-red-600 font-bold mt-4">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-[#18181B] mb-8 uppercase">Premium Listings Admin</h1>

        <div className="flex gap-4 mb-8">
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setListings([]);
              }}
              className={`px-6 py-3 font-bold uppercase border-3 transition-all ${
                status === s
                  ? 'bg-[#D97706] text-[#18181B] border-[#D97706]'
                  : 'bg-white text-[#18181B] border-[#18181B]'
              }`}
            >
              {s === 'pending' ? '⏳ Pending' : s === 'approved' ? '✅ Approved' : '❌ Rejected'}
            </button>
          ))}
        </div>

        {message && (
          <div className="bg-[#86EFAC] border-3 border-[#18181B] p-4 mb-6 font-bold">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#18181B]/60 font-semibold">Loading...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="border-4 border-[#18181B] p-8 text-center bg-[#F5F5F5]">
            <p className="text-[#18181B]/60 font-semibold">No {status} premium listings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map(listing => (
              <div key={listing.id} className="border-4 border-[#18181B] p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-bold text-[#18181B]/60 uppercase">Listing</p>
                    <p className="text-lg font-black text-[#18181B]">{listing.listing_title}</p>
                    <p className="text-sm text-[#18181B]/60">{listing.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#18181B]/60 uppercase">Position & Amount</p>
                    <p className="text-lg font-black text-[#D97706]">
                      #{listing.position} - ${listing.amount_paid}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b-3 border-[#18181B]/20">
                  <div>
                    <p className="text-xs font-bold text-[#18181B]/60 uppercase">Founder</p>
                    <p className="text-sm font-bold text-[#18181B]">{listing.founder_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]/60 uppercase">Email</p>
                    <a href={`mailto:${listing.founder_email}`} className="text-sm font-bold text-[#D97706] hover:underline">
                      {listing.founder_email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]/60 uppercase">Phone</p>
                    <a href={`tel:${listing.founder_phone}`} className="text-sm font-bold text-[#D97706]">
                      {listing.founder_phone}
                    </a>
                  </div>
                </div>

                <p className="text-xs text-[#18181B]/60 mb-4">
                  Submitted: {new Date(listing.created_at).toLocaleDateString()}
                </p>

                {status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(listing.id)}
                      className="flex-1 px-4 py-3 bg-[#86EFAC] text-[#18181B] font-black uppercase border-3 border-[#18181B] hover:scale-105 transition-all"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(listing.id)}
                      className="flex-1 px-4 py-3 bg-red-100 text-red-700 font-black uppercase border-3 border-red-400 hover:scale-105 transition-all"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
