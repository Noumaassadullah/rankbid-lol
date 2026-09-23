'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';

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
    totalVotes: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Listing[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
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
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0F3460] to-[#1a5490] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">{user.name || user.email.split('@')[0]}</h1>
                <p className="text-gray-600 text-sm mt-1">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-32 z-40">
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
                  <div className="grid gap-4">
                    {submissions.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/product/${listing.id}`}
                        className="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#0F3460]/400 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {listing.title || (listing.handle ? `@${listing.handle}` : listing.url)}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
                            <div className="flex gap-4 flex-wrap text-sm">
                              <span className="text-gray-600">
                                <span className="font-semibold">{listing.totalVotes}</span> total votes
                              </span>
                              <span className="text-gray-600">
                                <span className="font-semibold">{listing.dayVotes}</span> today
                              </span>
                              <span className="bg-[#0F3460]/10 text-[#0F3460]/700 px-2 py-1 rounded">
                                {listing.platform}
                              </span>
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {listing.category}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
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
                  <div className="grid gap-4">
                    {votes.map((vote) => (
                      <div
                        key={vote.id}
                        className="bg-white rounded-lg p-6 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">
                              Voted on {new Date(vote.votedAt).toLocaleDateString()}
                            </p>
                            <h3 className="text-lg font-bold text-gray-900">
                              {vote.listing?.title || 'Loading...'}
                            </h3>
                            {vote.listing && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">
                                  {vote.listing.totalVotes}
                                </span>{' '}
                                votes
                              </div>
                            )}
                          </div>
                          {vote.listing && (
                            <Link
                              href={`/product/${vote.listingId}`}
                              className="text-[#0F3460] hover:text-[#0F3460]/700 font-semibold text-sm ml-4"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
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
