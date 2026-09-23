'use client';

import Header from '@/components/Header';
import PlatformIcon from '@/components/PlatformIcon';
import Pagination from '@/components/Pagination';
import { useState, useEffect, useCallback } from 'react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  totalVotes: number;
  dayVotes: number;
  clickCount: number;
  createdAt: string;
  imageUrl?: string;
  userVoted?: boolean;
}

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: '#E4405F', description: 'Instagram profiles & creators' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼', color: '#0A66C2', description: 'LinkedIn profiles & companies' },
  { id: 'twitter', label: 'X / Twitter', emoji: '✕', color: '#000000', description: 'Twitter/X profiles & accounts' },
  { id: 'facebook', label: 'Facebook', emoji: '👥', color: '#1877F2', description: 'Facebook pages & profiles' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵', color: '#000000', description: 'TikTok creators & accounts' },
  { id: 'website', label: 'Websites', emoji: '🌐', color: '#0F3460', description: 'Web products & services' },
];

const Icons = {
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
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
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

export default function PlatformsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [votedListings, setVotedListings] = useState<Set<string>>(new Set());
  const [voterId, setVoterId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('rankbid_voter_id');
    if (stored) {
      setVoterId(stored);
    } else {
      const newId = 'voter_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rankbid_voter_id', newId);
      setVoterId(newId);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchListings(1);
  }, [selectedPlatform]);

  const fetchListings = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const platformFilter = selectedPlatform === 'twitter' ? ['twitter', 'x'] : [selectedPlatform];
      const params = new URLSearchParams();
      params.append('sort', 'totalVotes');
      params.append('page', page.toString());
      params.append('pageSize', '20');
      platformFilter.forEach(p => params.append('platform', p));

      const res = await fetch(`/api/listings/submit?${params.toString()}`);
      if (!res.ok) {
        setListings([]);
        return;
      }

      const text = await res.text();
      if (!text) {
        setListings([]);
        return;
      }

      const data = JSON.parse(text);
      setListings(data.listings || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform]);

  const handleVote = useCallback(async (listingId: string) => {
    if (!voterId) return;

    setVotedListings(prev => new Set([...prev, listingId]));

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, voterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setVotedListings(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
      } else {
        setTimeout(() => fetchListings(currentPage), 1500);
      }
    } catch (error) {
      setVotedListings(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  }, [voterId, currentPage, fetchListings]);

  const selectedPlatformInfo = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-[#0F3460] to-[#0D2A50] py-6 sm:py-10 md:py-16 text-white">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
              <Icons.TrendingUp />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black">Social Platforms</h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl">Explore top-ranked creators, profiles, and accounts across all major social media platforms. See what's trending in your favorite communities.</p>
          </div>
        </section>

        {/* PLATFORM SELECTOR */}
        <section className="bg-white py-4 sm:py-6 md:py-10 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-2 sm:p-3 md:p-4 rounded-xl transition-all duration-200 border-2 hover:scale-105 active:scale-95 flex flex-col items-center gap-1.5 sm:gap-2 text-center ${
                    selectedPlatform === platform.id
                      ? 'bg-[#0F3460] text-white border-[#0F3460] shadow-lg'
                      : 'bg-gray-50 text-[#1F2937] border-gray-200 hover:border-[#0F3460]/50'
                  }`}
                >
                  <span className="text-xl sm:text-2xl md:text-3xl">{platform.emoji}</span>
                  <span className="font-black text-xs uppercase">{platform.label}</span>
                  <span className={`text-xs font-semibold ${selectedPlatform === platform.id ? 'opacity-80' : 'text-[#1F2937]/60'}`}>
                    {listings.filter(l =>
                      platform.id === 'twitter'
                        ? ['twitter', 'x'].includes(l.platform)
                        : l.platform === platform.id
                    ).length} listings
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM HEADER */}
        {selectedPlatformInfo && (
          <section className={`bg-gradient-to-r py-4 sm:py-6 md:py-10 border-b border-gray-200`} style={{
            backgroundImage: `linear-gradient(135deg, ${selectedPlatformInfo.color}15 0%, ${selectedPlatformInfo.color}05 100%)`
          }}>
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-md"
                  style={{backgroundColor: selectedPlatformInfo.color + '20'}}
                >
                  {selectedPlatformInfo.emoji}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#1F2937] mb-1">{selectedPlatformInfo.label}</h2>
                  <p className="text-sm md:text-base text-[#1F2937]/70">{selectedPlatformInfo.description}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LISTINGS */}
        <section className="bg-white py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl">⏳</div>
                <p className="text-[#1F2937]/60 font-semibold mt-2">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 border-4 border-gray-300 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-2xl font-black text-[#1F2937] mb-2">No listings yet</p>
                <p className="text-base text-[#1F2937]/60 mb-6">Be the first to submit a {selectedPlatformInfo?.label.toLowerCase()}!</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#0F3460] text-white font-black text-sm rounded-xl hover:bg-[#0D2A50] active:scale-95 transition-all shadow-lg"
                >
                  Start Submitting
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {listings.map((listing, idx) => {
                  const position = (currentPage - 1) * 20 + idx + 1;
                  const isTopThree = position <= 3;
                  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';

                  return (
                    <a
                      key={listing.id}
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 md:p-5 rounded-xl border-2 transition-all duration-200 group hover:scale-102 ${
                        isTopThree
                          ? 'bg-gradient-to-r from-[#0F3460]/5 to-[#0F3460]/10 border-[#0F3460]/30 shadow-md hover:shadow-lg hover:border-[#0F3460]/60'
                          : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-[#0F3460]/30'
                      }`}
                    >
                      {/* Position */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm md:text-base ${
                          isTopThree
                            ? 'bg-gradient-to-br from-[#0F3460] to-[#0D2A50] text-white shadow-md text-2xl'
                            : 'bg-gray-100 text-[#1F2937]'
                        }`}>
                          {medal || `#${position}`}
                        </div>

                        {/* Submission Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold truncate group-hover:text-[#0F3460] transition-colors ${
                            isTopThree
                              ? 'text-base md:text-lg text-[#0F3460]'
                              : 'text-sm md:text-base text-[#1F2937]'
                          }`}>
                            {listing.title}
                          </p>
                        </div>
                      </div>

                      {/* Votes */}
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <div className="text-right">
                          <p className={`font-black transition-colors ${
                            isTopThree
                              ? 'text-xl md:text-2xl text-[#0F3460]'
                              : 'text-base md:text-lg text-[#0F3460]'
                          }`}>
                            {listing.totalVotes}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleVote(listing.id);
                          }}
                          disabled={votedListings.has(listing.id)}
                          className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-bold transition-all duration-200 active:scale-95 border-2 flex-shrink-0 ${
                            votedListings.has(listing.id)
                              ? 'bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed'
                              : 'bg-white border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white'
                          }`}
                          title={votedListings.has(listing.id) ? 'Already voted' : 'Vote'}
                        >
                          <Icons.Heart />
                        </button>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {listings.length > 0 && totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    fetchListings(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
