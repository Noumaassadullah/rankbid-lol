'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import PlatformIcon from '@/components/PlatformIcon';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  url?: string;
  handle?: string;
  platform: string;
  totalVotes: number;
  dayVotes: number;
  category: string;
  createdAt: string;
}

interface Vote {
  id: string;
  listingId: string;
  votedAt: string;
  listing?: {
    id: string;
    title: string;
    description: string;
    url?: string;
    totalVotes: number;
  };
}

const Icons = {
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Listing[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'votes' | 'settings'>('submissions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchUserData(userData.id);
    } catch {
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const fetchUserData = async (userId: string) => {
    try {
      const submissionsRes = await fetch(`/api/user/submissions?userId=${userId}`);
      if (submissionsRes.ok) {
        const data = await submissionsRes.json();
        setSubmissions(data.listings || []);
      }

      const votesRes = await fetch(`/api/user/votes?userId=${userId}`);
      if (votesRes.ok) {
        const data = await votesRes.json();
        setVotes(data.votes || []);
      }

      // Fetch all listings to calculate rankings
      const allListingsRes = await fetch(`/api/listings?limit=1000&offset=0`);
      if (allListingsRes.ok) {
        const listings = await allListingsRes.json();
        setAllListings(listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRank = (totalVotes: number): number => {
    return allListings.filter(l => (l.totalVotes || 0) > totalVotes).length + 1;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0F3460] to-[#1a5490] rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-black text-gray-900 truncate" style={{fontSize: '20px'}}>{user.name || user.email.split('@')[0]}</h1>
                <p className="text-gray-600 text-sm mt-1 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white font-semibold text-sm md:text-base rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-1 border-b-2 font-semibold transition-colors ${
                activeTab === 'submissions'
                  ? 'border-[#0F3460]/600 text-[#0F3460]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('votes')}
              className={`py-4 px-1 border-b-2 font-semibold transition-colors ${
                activeTab === 'votes'
                  ? 'border-[#0F3460]/600 text-[#0F3460]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Votes ({votes.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'border-[#0F3460]/600 text-[#0F3460]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin text-[#0F3460] text-2xl">⏳</div>
          </div>
        ) : (
          <>
            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">My Submissions</h2>
                  <p className="text-gray-600">Products and services you've submitted to RankBid</p>
                </div>

                {submissions.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                    <p className="text-gray-600 text-lg mb-6">You haven't submitted anything yet.</p>
                    <Link
                      href="/#claim"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F3460] text-white font-semibold rounded-lg hover:bg-[#0D2A50] transition-colors"
                    >
                      Submit Your First Product
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((listing) => {
                      const rank = calculateRank(listing.totalVotes);
                      let faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                      try {
                        if (listing.url) {
                          const urlObj = new URL(listing.url);
                          faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`;
                        }
                      } catch {
                        // If URL parsing fails, use placeholder
                      }

                      const platformLabel = listing.platform || 'website';

                      return (
                        <Link
                          key={listing.id}
                          href={`/product/${listing.id}`}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md hover:border-[#0F3460]/30 transition-all duration-200 group cursor-pointer gap-4"
                        >
                          {/* Left Section: Position Badge and Favicon */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-9 h-9 bg-[#0F3460] text-white font-black text-xs rounded-lg flex items-center justify-center flex-shrink-0">
                              #{rank}
                            </div>
                            {listing.url && (
                              <img src={faviconUrl} alt="favicon" className="w-6 h-6 rounded flex-shrink-0" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'; }} />
                            )}

                            {/* Title, Category and Platform Icon - All inline */}
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <p className="text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#0F3460] transition-colors">
                                {listing.title || (listing.handle ? `@${listing.handle}` : listing.url)}
                              </p>

                              {/* Platform Icon */}
                              <div className="w-4 h-4 flex-shrink-0" title={platformLabel}>
                                <PlatformIcon platform={platformLabel} size={16} />
                              </div>

                              {/* Category Tag */}
                              {listing.category && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Icons.Tag />
                                  <p className="text-xs text-[#1F2937]/70 font-semibold">{listing.category}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Section: Vote Count and Actions */}
                          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                            {/* Vote Count */}
                            <p className="text-lg font-black text-[#0F3460] min-w-[1.5rem] text-right">
                              {listing.totalVotes}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1 whitespace-nowrap bg-white border border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white`}
                              >
                                <Icons.Heart />
                                Vote
                              </button>

                              <button
                                className="text-xs font-semibold px-3 py-1.5 bg-white border border-orange-300 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                              >
                                📤 Share
                              </button>

                              <button
                                className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                              >
                                ⭐ Premium
                              </button>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Votes Tab */}
            {activeTab === 'votes' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">My Votes</h2>
                  <p className="text-gray-600">Products and services you've voted for</p>
                </div>

                {votes.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                    <p className="text-gray-600 text-lg mb-6">You haven't voted yet.</p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F3460] text-white font-semibold rounded-lg hover:bg-[#0D2A50] transition-colors"
                    >
                      Explore Rankings
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {votes.map((vote, idx) => {
                      let faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';

                      if (vote.listing?.url) {
                        try {
                          const urlObj = new URL(vote.listing.url);
                          faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`;
                        } catch {
                          // If URL parsing fails, use default
                        }
                      }

                      return (
                        <Link
                          key={vote.id}
                          href={`/product/${vote.listingId}`}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md hover:border-[#0F3460]/30 transition-all duration-200 group cursor-pointer gap-4"
                        >
                          {/* Left Section: Vote Badge and Favicon */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-9 h-9 bg-[#0F3460] text-white font-black text-xs rounded-lg flex items-center justify-center flex-shrink-0">
                              ♥
                            </div>
                            <img
                              src={faviconUrl}
                              alt="favicon"
                              className="w-6 h-6 rounded flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                              }}
                            />
                            {/* Title */}
                            <p className="text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#0F3460] transition-colors flex-1 min-w-0">
                              {vote.listing?.title || 'Product'}
                            </p>
                          </div>

                          {/* Right Section: Vote Count and Actions */}
                          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                            {/* Vote Count */}
                            <p className="text-lg font-black text-[#0F3460] min-w-[1.5rem] text-right">
                              {vote.listing?.totalVotes || 0}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1 whitespace-nowrap bg-white border border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white`}
                              >
                                <Icons.Heart />
                                Vote
                              </button>

                              <button
                                className="text-xs font-semibold px-3 py-1.5 bg-white border border-orange-300 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                              >
                                📤 Share
                              </button>

                              <button
                                className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                              >
                                ⭐ Premium
                              </button>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                  <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="bg-white rounded-lg p-8 border border-gray-200">
                  <div className="space-y-8">
                    {/* Account Section */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Display Name
                          </label>
                          <p className="text-gray-600">{user.name || 'Not set'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            To change your name, please contact support
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <p className="text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        disabled
                      >
                        Delete Account (Coming Soon)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </>
  );
}
