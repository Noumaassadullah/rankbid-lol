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
  { id: 'instagram', label: 'Instagram', icon: '/instagram.png', color: '#E4405F', description: 'Instagram profiles & creators' },
  { id: 'linkedin', label: 'LinkedIn', icon: '/linkedin.png', color: '#0A66C2', description: 'LinkedIn profiles & companies' },
  { id: 'twitter', label: 'X / Twitter', icon: '/twitter.png', color: '#000000', description: 'Twitter/X profiles & accounts' },
  { id: 'facebook', label: 'Facebook', icon: '/facebook.png', color: '#1877F2', description: 'Facebook pages & profiles' },
  { id: 'tiktok', label: 'TikTok', icon: '/twitter.png', color: '#000000', description: 'TikTok creators & accounts' },
  { id: 'website', label: 'Websites', icon: '/web.png', color: '#0F3460', description: 'Web products & services' },
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
  Instagram: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.807 0-9.726h3.554v1.375c.429-.66 1.196-1.6 2.905-1.6 2.122 0 3.714 1.388 3.714 4.37v5.581zM5.337 8.855c-1.144 0-1.915-.762-1.915-1.715 0-.957.77-1.715 1.958-1.715 1.187 0 1.927.758 1.94 1.715 0 .953-.753 1.715-1.983 1.715zm1.946 11.597H3.392V9.726h3.891v10.726zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
    </svg>
  ),
  Twitter: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 002.856-3.906 10 10 0 01-2.887.77 4.992 4.992 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.992 4.992 0 00-8.506 4.547A14.148 14.148 0 011.392 6.859a4.986 4.986 0 001.546 6.571 4.944 4.944 0 01-2.265-.57v.06a4.993 4.993 0 003.995 4.882 4.993 4.993 0 01-2.212.085 4.994 4.994 0 004.664 3.477A10.016 10.016 0 010 19.54a14.108 14.108 0 007.666 2.247c9.201 0 14.209-7.539 14.209-14.07 0-.214-.005-.428-.015-.64a10.012 10.012 0 002.457-2.548z"/>
    </svg>
  ),
  Facebook: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  TikTok: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.66 1.94 2.89 2.89 0 015.66-1.94v-3.56a8.7 8.7 0 00-5.66 2.04A7.24 7.24 0 001 12.04a7.23 7.23 0 0010.26 6.63 7.18 7.18 0 001.93-5.2V9.4a9.45 9.45 0 005.4 1.51V7.11a5.16 5.16 0 01-.59-.04z"/>
    </svg>
  ),
  Globe: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm.466 19.88c-.565 0-2.03-.145-2.788-.81-.424-.357-.393-.8 1.087-3.205.778-1.2 1.697-2.616 2.235-3.08.538-.463 1.04.148.503.611-.536.463-1.46 1.879-2.238 3.078-1.48 2.406-1.51 2.848-1.087 3.206.76.665 2.223.81 2.787.81.565 0 2.03-.145 2.787-.81.423-.357.393-.8-1.088-3.206-.777-1.2-1.696-2.616-2.234-3.079-.538-.463-1.04-.148-.502.611.535.463 1.458 1.879 2.235 3.08 1.48 2.405 1.51 2.848 1.088 3.205-.757.665-2.222.81-2.786.81zm5.404-6.33c-.48.648-1.163 1.587-1.525 2.098-.723.989-.685 1.333.16 2.167.555.529 1.256 1.17 1.558 1.427.303.257.685.257.988 0 .302-.257 1.003-.898 1.558-1.427.845-.834.883-1.178.16-2.167-.362-.511-1.044-1.45-1.524-2.098zm7.68-3.26h-2.95v3.74h3.154c.328-1.176.526-2.488.526-3.74h-.73zm-4.75-1.71v1.71h3.05c-.075-1.003-.262-1.923-.543-2.71H19.4c.45.86.77 1.87.93 2.71zm-5.97-1.71h-1.35v1.71h3.854c.06-.77.093-1.545.107-2.25l-.277-.03c-.85-.086-1.707-.045-2.334.58zm5.77 9.97c-.152.33-.33.648-.52.947h3.46v-3.72c-.163 1.063-.414 2.067-.755 2.77zm-1.25 1.01c-.312.27-.632.527-.97.764.485.52 1.125 1.133 1.466 1.45.34.316.77.32 1.11.01.34-.31.98-.93 1.466-1.45-.338-.237-.658-.494-.97-.764-.312.27-.658.494-.97.764zm1.94-3.78v3.72h3.46c-.189-.299-.368-.617-.52-.947-.34-1.701-.591-2.705-.755-2.77zm5.09 3.72h2.95V11.6h-.74c-.08 1.3-.28 2.56-.63 3.74z"/>
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
                  <img src={platform.icon} alt={platform.label} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain" />
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
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-md p-2"
                  style={{backgroundColor: selectedPlatformInfo.color + '20'}}
                >
                  <img src={selectedPlatformInfo.icon} alt={selectedPlatformInfo.label} className="w-8 h-8 md:w-10 md:h-10 object-contain" />
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
