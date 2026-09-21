'use client';

import Header from '@/components/Header';
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

const CATEGORIES = [
  { value: 'Marketing', label: 'Marketing' },
  { value: 'SEO', label: 'SEO' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'Agents', label: 'Agents' },
  { value: 'Crypto', label: 'Crypto' },
  { value: 'Developer', label: 'Developer' },
  { value: 'Health', label: 'Health' },
  { value: 'Games', label: 'Games' },
  { value: 'Business', label: 'Business' },
  { value: 'Ecommerce', label: 'Ecommerce' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Directories', label: 'Directories' },
  { value: 'AIMedia', label: 'AI Media' },
  { value: 'Agencies', label: 'Agencies' },
  { value: 'Social', label: 'Social' },
  { value: 'Education', label: 'Education' },
  { value: 'People', label: 'People' },
  { value: 'Design', label: 'Design' },
  { value: 'Hiring', label: 'Hiring' },
  { value: 'Domains', label: 'Domains' },
  { value: 'Security', label: 'Security' },
  { value: 'Sales', label: 'Sales' },
  { value: 'News', label: 'News' },
  { value: 'RealEstate', label: 'Real Estate' },
  { value: 'Writing', label: 'Writing' },
  { value: 'Audio', label: 'Audio' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'Unlimited', label: 'Unlimited' },
  { value: 'Other', label: 'Other' }
];

const PLATFORMS = [
  { id: 'website', label: 'Website' },
  { id: 'twitter', label: 'Twitter/X' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' }
];

const getCategoryLabel = (categoryValue: string): string => {
  const category = CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// SVG Icons Component
const Icons = {
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h.01M9 20h6" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Vote: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Trophy: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState<'alltime' | 'today'>('alltime');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [formData, setFormData] = useState({
    url: '',
    handle: '',
    description: '',
    category: '',
    platform: 'website',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState('website');
  const [detectedCategory, setDetectedCategory] = useState('');
  const [votedListings, setVotedListings] = useState<Set<string>>(new Set());
  const [voterId, setVoterId] = useState<string>('');
  const [optimisticVotes, setOptimisticVotes] = useState<Record<string, number>>({});

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const stored = localStorage.getItem('rankbid_voter_id');
    if (stored) {
      setVoterId(stored);
    } else {
      const newId = 'voter_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rankbid_voter_id', newId);
      setVoterId(newId);
    }
    fetchListings();
  }, [activeTimeFilter]);

  const handleVote = useCallback(async (listingId: string) => {
    if (!voterId) {
      addToast('Please wait for the page to load', 'error');
      return;
    }

    setVotedListings(prev => new Set([...prev, listingId]));
    setOptimisticVotes(prev => ({
      ...prev,
      [listingId]: (prev[listingId] || 0) + 1
    }));

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, voterId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Vote recorded! ✨', 'success');
        setTimeout(async () => {
          const sort = activeTimeFilter === 'today' ? 'dayVotes' : 'totalVotes';
          const fetchRes = await fetch(`/api/listings/submit?sort=${sort}&limit=100`);
          if (fetchRes.ok) {
            const text = await fetchRes.text();
            if (text) {
              const data = JSON.parse(text);
              setListings(data.listings || []);
              setOptimisticVotes({});
            }
          }
        }, 1500);
      } else if (data.error === 'Already voted') {
        setVotedListings(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
        setOptimisticVotes(prev => {
          const newVotes = {...prev};
          delete newVotes[listingId];
          return newVotes;
        });
        addToast('You already voted for this', 'error');
      }
    } catch (error) {
      setVotedListings(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
      addToast('Voting failed, please try again', 'error');
    }
  }, [voterId, activeTimeFilter]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const sort = activeTimeFilter === 'today' ? 'dayVotes' : 'totalVotes';
      const res = await fetch(`/api/listings/submit?sort=${sort}&limit=100`);
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
    } catch (error) {
      setListings([]);
      addToast('Failed to load rankings', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTimeFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    if (!formData.url && !formData.handle) {
      errors.url = 'Please enter a URL or handle';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setFormLoading(true);

    try {
      const submitData = {
        url: formData.platform === 'website' ? formData.url : undefined,
        handle: formData.platform !== 'website' ? (formData.url || formData.handle) : undefined,
        description: formData.description,
        category: formData.category,
        platform: formData.platform,
      };

      const res = await fetch('/api/listings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast('🎉 Your product is live! Community voting starts now.', 'success');
      setFormData({ url: '', handle: '', description: '', category: '', platform: 'website' });
      setDetectedPlatform('website');
      setDetectedCategory('');
      fetchListings();
    } catch (error: any) {
      addToast(error.message || 'Submission failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const topListings = activeTimeFilter === 'today'
    ? listings.slice(0, 10).sort((a, b) => b.dayVotes - a.dayVotes)
    : listings.slice(0, 10).sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <>
      <Header />
      <div className="bg-white text-[#18181B]">

        {/* PREMIUM BANNER HERO SECTION */}
        <section className="bg-gradient-to-br from-white via-[#F5F5F5] to-white pt-16 pb-16 border-b-4 border-[#18181B] relative overflow-hidden fade-in">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB28F] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#86EFAC] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFB28F]/20 border-2 border-[#FFB28F] rounded-full mb-6">
                  <Icons.Sparkles />
                  <span className="text-xs font-bold text-[#FFB28F] uppercase tracking-widest">Premium Ranking Platform</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-[#18181B] mb-6 leading-tight">
                  Rank Everything.
                </h1>

                <p className="text-lg text-[#18181B]/75 mb-8 leading-relaxed font-medium">
                  No algorithms. No gatekeepers. Pure community voting power. Let the world discover your product through transparent, democratic rankings.
                </p>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FFB28F]/20 rounded-lg flex items-center justify-center text-[#FFB28F]">
                      <Icons.Users />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[#18181B]">100K+</p>
                      <p className="text-xs text-[#18181B]/60 font-semibold">Ranked Products</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#86EFAC]/20 rounded-lg flex items-center justify-center text-[#86EFAC]">
                      <Icons.TrendingUp />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[#18181B]">Real-time</p>
                      <p className="text-xs text-[#18181B]/60 font-semibold">Live Updates</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-8 py-4 bg-[#FFB28F] text-[#18181B] font-black uppercase text-sm border-4 border-[#18181B] hover:scale-105 active:scale-95 transition-transform duration-150"
                    style={{boxShadow: '-6px 6px 0px rgba(24,24,27,0.3)'}}
                  >
                    <Icons.Upload />
                    Submit Now
                  </button>
                  <button
                    onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-[#18181B] font-black uppercase text-sm border-4 border-[#18181B] hover:bg-[#FFB28F] hover:scale-105 active:scale-95 transition-all duration-150"
                    style={{boxShadow: '6px 6px 0px rgba(24,24,27,0.3)'}}
                  >
                    <Icons.TrendingUp />
                    View Rankings
                  </button>
                </div>
              </div>

              {/* Right Visual */}
              <div className="hidden md:block">
                <div className="bg-white border-4 border-[#18181B] p-8 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300">
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-[#F5F5F5] border-2 border-[#E4E4E7] rounded">
                        <div className="w-10 h-10 bg-[#FFB28F] text-white font-black rounded flex items-center justify-center">#{i}</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#18181B]">Top Product {i}</p>
                          <p className="text-xs text-[#18181B]/60">Marketing</p>
                        </div>
                        <p className="font-black text-[#FFB28F] text-lg">{1000 - i * 200}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="bg-[#F5F5F5] py-12 border-b-4 border-[#18181B] fade-in">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Icons.Upload />
              <h2 className="text-2xl font-black text-[#18181B] uppercase">Submit Your Product</h2>
            </div>

            {/* Platform Selection */}
            <div className="flex flex-wrap gap-3 mb-6">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`px-4 py-2 font-bold text-xs uppercase border-3 transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                    formData.platform === platform.id
                      ? 'bg-[#FFB28F] text-[#18181B] border-[#18181B]'
                      : 'bg-white text-[#18181B] border-[#18181B] hover:bg-[#FFB28F]'
                  }`}
                >
                  <Icons.Globe />
                  {platform.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="url"
                    placeholder="Product URL or handle"
                    value={formData.url}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white text-[#18181B] border-3 border-[#18181B] font-semibold text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFB28F] focus:ring-offset-2 transition-all duration-200 ${
                      formErrors.url ? 'border-red-500 shake' : ''
                    }`}
                    required
                  />
                  {formErrors.url && (
                    <p className="text-xs text-red-600 font-bold mt-1 slide-in">{formErrors.url}</p>
                  )}
                </div>

                <div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white text-[#18181B] border-3 border-[#18181B] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB28F] focus:ring-offset-2 transition-all duration-200 ${
                      formErrors.category ? 'border-red-500 shake' : ''
                    }`}
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-xs text-red-600 font-bold mt-1 slide-in">{formErrors.category}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading || metadataLoading}
                className="w-full px-6 py-4 bg-[#FFB28F] text-[#18181B] font-black uppercase text-sm border-4 border-[#18181B] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                style={{boxShadow: formLoading ? 'none' : '-4px 4px 0px rgba(24,24,27,0.3), -8px 8px 0px rgba(24,24,27,0.15)'}}
              >
                {formLoading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span> Submitting...
                  </>
                ) : (
                  <>
                    <Icons.Upload />
                    SUBMIT
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* LEADERBOARD SECTION */}
        <section id="leaderboard" className="bg-white py-12 border-b-4 border-[#18181B] fade-in">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Icons.Trophy />
                <h2 className="text-2xl font-black text-[#18181B] uppercase">Top Rankings</h2>
              </div>
              <div className="flex gap-2">
                {['alltime', 'today'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveTimeFilter(filter as 'alltime' | 'today')}
                    className={`px-4 py-2 font-bold text-xs uppercase border-3 transition-all duration-200 hover:scale-105 ${
                      activeTimeFilter === filter
                        ? 'bg-[#FFB28F] text-[#18181B] border-[#18181B]'
                        : 'bg-white text-[#18181B] border-[#18181B] hover:bg-[#FFB28F]'
                    }`}
                  >
                    {filter === 'alltime' ? 'All Time' : 'Today'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl">⏳</div>
                <p className="text-[#18181B]/60 font-semibold mt-2">Loading rankings...</p>
              </div>
            ) : topListings.length === 0 ? (
              <div className="text-center py-12 border-4 border-[#18181B] bg-[#F5F5F5] fade-in">
                <Icons.Users />
                <p className="text-sm font-bold text-[#18181B] mb-4 mt-4">No rankings yet</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-[#FFB28F] text-[#18181B] font-bold text-xs uppercase border-3 border-[#18181B] hover:scale-105 transition-all duration-200"
                >
                  Be First to Submit
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {topListings.map((listing, idx) => {
                  const baseVoteCount = activeTimeFilter === 'today' ? listing.dayVotes : listing.totalVotes;
                  const voteCount = (optimisticVotes[listing.id] || 0) + baseVoteCount;

                  return (
                    <a
                      key={listing.id}
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border-3 border-[#18181B] hover:bg-[#FFB28F] hover:scale-101 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-[#FFB28F] text-[#18181B] font-black rounded-lg flex items-center justify-center">#{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#18181B] truncate">{listing.title}</p>
                          {listing.category && (
                            <p className="text-xs text-[#18181B]/60 mt-1 flex items-center gap-1">
                              <Icons.Vote />
                              {getCategoryLabel(listing.category)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-2xl font-black text-[#FFB28F] group-hover:text-[#18181B] transition-colors">{voteCount}</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleVote(listing.id);
                          }}
                          disabled={votedListings.has(listing.id)}
                          className={`text-sm font-bold px-3 py-1.5 mt-2 border-2 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-1 justify-center ${
                            votedListings.has(listing.id)
                              ? 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
                              : 'bg-white text-[#FFB28F] border-[#FFB28F] hover:bg-[#FFB28F] hover:text-white'
                          }`}
                        >
                          <Icons.Heart />
                          {votedListings.has(listing.id) ? 'Voted' : 'Vote'}
                        </button>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-[#F5F5F5] py-12 border-b-4 border-[#18181B] fade-in">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Icons.Zap />
              <h2 className="text-2xl font-black text-[#18181B] uppercase">How It Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: '1', title: 'Submit', desc: 'Add your product', icon: Icons.Upload },
                { num: '2', title: 'Vote', desc: 'Community votes', icon: Icons.Vote },
                { num: '3', title: 'Rank', desc: 'Climb rankings', icon: Icons.Trophy }
              ].map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={i}
                    className="border-4 border-[#18181B] p-8 bg-white text-center hover:bg-[#FFB28F] hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="flex justify-center mb-4 text-[#FFB28F] group-hover:text-[#18181B] text-4xl transition-colors">
                      <StepIcon />
                    </div>
                    <p className="text-4xl font-black text-[#FFB28F] group-hover:text-[#18181B] mb-2">{step.num}</p>
                    <h3 className="text-lg font-black text-[#18181B] uppercase mb-2">{step.title}</h3>
                    <p className="text-sm text-[#18181B]/70 font-semibold">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 border-3 border-[#18181B] font-bold text-sm animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-[#86EFAC] text-[#18181B]'
                : toast.type === 'error'
                ? 'bg-red-100 text-red-700 border-red-400'
                : 'bg-white text-[#18181B]'
            }`}
            style={{boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}
          >
            {toast.type === 'success' && <Icons.Check />}
            {toast.type === 'error' && <Icons.Zap />}
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
