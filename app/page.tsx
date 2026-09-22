'use client';

import Header from '@/components/Header';
import FAQ from '@/components/FAQ';
import Pagination from '@/components/Pagination';
import PlatformIcon from '@/components/PlatformIcon';
import PremiumListingCard from '@/components/PremiumListingCard';
import PremiumListingModal from '@/components/PremiumListingModal';
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
  isPremium: boolean;
  premiumPosition?: number | null;
  founderName?: string | null;
  founderEmail?: string | null;
  founderPhone?: string | null;
  founderWebsite?: string | null;
  founderTwitter?: string | null;
  founderLinkedin?: string | null;
  founderInstagram?: string | null;
  founderFacebook?: string | null;
  founderTiktok?: string | null;
  founderYoutube?: string | null;
  founderGithub?: string | null;
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
  Star: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState<'alltime' | 'today'>('alltime');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedListingForPremium, setSelectedListingForPremium] = useState<Listing | null>(null);

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
    setCurrentPage(1);
    fetchListings(1);
  }, [activeTimeFilter, selectedCategory]);

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

  const fetchListings = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const sort = activeTimeFilter === 'today' ? 'dayVotes' : 'totalVotes';
      const categoryParam = selectedCategory === 'All' ? '' : `&category=${encodeURIComponent(selectedCategory)}`;
      const timeParam = activeTimeFilter === 'today' ? '&timeFilter=today' : '';
      const res = await fetch(`/api/listings/submit?sort=${sort}&page=${page}&pageSize=15${categoryParam}${timeParam}`);
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
      setListings([]);
      addToast('Failed to load rankings', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTimeFilter, selectedCategory]);

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

      const displayName = data.displayHandle ? `@${data.displayHandle}` : 'Your product';
      addToast(`🎉 ${displayName} is live! Community voting starts now.`, 'success');
      setFormData({ url: '', handle: '', description: '', category: '', platform: 'website' });
      setDetectedPlatform('website');
      setDetectedCategory('');
      setCurrentPage(1);
      fetchListings(1);
    } catch (error: any) {
      addToast(error.message || 'Submission failed', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePremiumSubmit = async (data: any) => {
    if (!selectedListingForPremium) return;

    try {
      const res = await fetch('/api/listings/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListingForPremium.id,
          ...data,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      addToast('✨ Premium listing request submitted! Admin approval pending.', 'success');
      setPremiumModalOpen(false);
      setSelectedListingForPremium(null);
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">

        {/* BANNER HERO SECTION */}
        <section className="bg-white pt-16 pb-16 border-b border-gray-200 relative overflow-hidden fade-in">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F3460] text-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#059669] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-black text-[#1F2937] mb-6 leading-tight">
                  Rank Everything.
                </h1>

                <p className="text-lg text-[#1F2937]/75 mb-8 leading-relaxed font-medium">
                  No algorithms. No gatekeepers. Pure community voting power. Let the world discover your product through transparent, democratic rankings.
                </p>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#0F3460] text-white rounded-lg flex items-center justify-center text-white">
                      <Icons.Users />
                    </div>
                    <div>
                      <p className="text-2xl font-black">100K+</p>
                      <p className="text-xs text-[#1F2937]/60 font-semibold">Ranked Products</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#059669] rounded-lg flex items-center justify-center text-[#1F2937]">
                      <Icons.TrendingUp />
                    </div>
                    <div>
                      <p className="text-2xl font-black">Real-time</p>
                      <p className="text-xs text-[#1F2937]/60 font-semibold">Live Updates</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-8 py-4 bg-[#0F3460] text-white font-black uppercase text-sm border-[#0F3460] border-4 hover:scale-105 active:scale-95 transition-all duration-150"
                    style={{boxShadow: 'none'}}
                  >
                    <Icons.Upload />
                    Submit Now
                  </button>
                  <button
                    onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-[#1F2937] font-black uppercase text-sm border-gray-300 border-4 hover:scale-105 active:scale-95 transition-all duration-150"
                    style={{boxShadow: 'none'}}
                  >
                    <Icons.TrendingUp />
                    View Rankings
                  </button>
                </div>
              </div>

              {/* Right Visual */}
              <div className="hidden md:block">
                <div className="bg-white shadow-sm border border-gray-200 p-8 rounded-lg hover:scale-105 transition-transform duration-300">
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-[#E4E4E7] rounded">
                        <div className="w-10 h-10 bg-[#0F3460] text-white font-black rounded flex items-center justify-center">{`#${i}`}</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#1F2937]">Top Product {i}</p>
                          <p className="text-xs text-[#1F2937]/60">Marketing</p>
                        </div>
                        <p className="font-black text-[#0F3460] text-lg">{1000 - i * 200}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="bg-gray-50 py-12 border-b border-gray-200 fade-in">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Icons.Upload />
              <h2 className="text-2xl font-black text-[#1F2937] uppercase">Submit Your Product</h2>
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
                      ? 'bg-blue-100 text-[#1F2937] border-gray-300'
                      : 'bg-white text-[#1F2937] border-gray-300 hover:bg-blue-100'
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
                    placeholder={formData.platform === 'website' ? 'Product URL' : 'Profile URL or username'}
                    value={formData.url}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white text-[#1F2937] border-3 border-gray-300 font-semibold text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ${
                      formErrors.url ? 'border-red-500 shake' : ''
                    }`}
                    required
                  />
                  {formErrors.url && (
                    <p className="text-xs text-red-600 font-bold mt-1 slide-in">{formErrors.url}</p>
                  )}
                  {formData.platform !== 'website' && (
                    <p className="text-xs text-[#1F2937]/60 font-semibold mt-1">
                      {formData.platform === 'facebook' && 'e.g., facebook.com/yourpage or just yourpage'}
                      {formData.platform === 'instagram' && 'e.g., instagram.com/username or just @username'}
                      {formData.platform === 'tiktok' && 'e.g., tiktok.com/@username or just @username'}
                      {['twitter', 'x'].includes(formData.platform) && 'e.g., twitter.com/username or just @username'}
                    </p>
                  )}
                </div>

                <div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white text-[#1F2937] border-3 border-gray-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ${
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
                className="w-full px-6 py-4 bg-[#0F3460] text-white font-black uppercase text-sm border-[#0F3460] border-4 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                style={{boxShadow: 'none'}}
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
        <section id="leaderboard" className="bg-white py-12 border-b border-gray-200 fade-in">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Icons.Trophy />
                <h2 className="text-2xl font-black text-[#1F2937] uppercase">Top Rankings</h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['alltime', 'today'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveTimeFilter(filter as 'alltime' | 'today')}
                    className={`px-4 py-2 font-bold text-xs uppercase border-3 transition-all duration-200 hover:scale-105 ${
                      activeTimeFilter === filter
                        ? 'bg-[#0F3460] text-white border-[#0F3460]'
                        : 'bg-white text-[#1F2937] border-gray-300'
                    }`}
                  >
                    {filter === 'alltime' ? 'All Time' : 'Today'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-bold text-[#1F2937] mb-3 uppercase">Filter by Category</p>
              <div className="flex gap-2 flex-wrap">
                {['All', ...CATEGORIES.map(cat => cat.value)].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 font-bold text-xs uppercase border-2 transition-all duration-200 hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-[#0F3460] text-white border-[#0F3460]'
                        : 'bg-white text-[#1F2937] border-gray-300'
                    }`}
                  >
                    {category === 'All' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* PREMIUM LISTINGS SECTION */}
            {!loading && listings.filter(l => l.isPremium).length > 0 && (
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Icons.Star />
                  <h3 className="text-lg font-black text-[#1F2937] uppercase">Premium Featured</h3>
                </div>
                {listings.filter(l => l.isPremium).map((listing, idx) => (
                  <PremiumListingCard
                    key={listing.id}
                    listing={listing}
                    position={idx + 1}
                    onVote={handleVote}
                    hasVoted={votedListings.has(listing.id)}
                  />
                ))}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl">⏳</div>
                <p className="text-[#1F2937]/60 font-semibold mt-2">Loading rankings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 border-gray-300 border-4 bg-gray-50 fade-in">
                <Icons.Users />
                <p className="text-sm font-bold text-[#1F2937] mb-4 mt-4">No rankings yet</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-[#0F3460] text-white font-bold text-xs uppercase border-[#0F3460] border-3 hover:scale-105 transition-all duration-200"
                >
                  Be First to Submit
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {listings.map((listing, idx) => {
                  const baseVoteCount = activeTimeFilter === 'today' ? listing.dayVotes : listing.totalVotes;
                  const voteCount = (optimisticVotes[listing.id] || 0) + baseVoteCount;

                  const platformLabel = listing.platform || 'website';
                  let faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                  try {
                    const urlObj = new URL(listing.url);
                    faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`;
                  } catch {
                    // If URL parsing fails, use placeholder
                  }

                  return (
                    <a
                      key={listing.id}
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border-gray-300 border-3 hover:bg-[#0F3460]/10 hover:scale-101 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-[#0F3460] text-white font-black rounded-lg flex items-center justify-center">{`#${(currentPage - 1) * 15 + idx + 1}`}</div>
                        <img src={faviconUrl} alt="favicon" className="w-6 h-6 rounded" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'; }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#1F2937] truncate">{listing.title}</p>
                            <div className="w-5 h-5 flex-shrink-0" title={platformLabel}>
                              <PlatformIcon platform={platformLabel} size={20} />
                            </div>
                          </div>
                          {listing.category && (
                            <p className="text-xs text-[#1F2937]/60 mt-1 flex items-center gap-1">
                              <Icons.Vote />
                              {getCategoryLabel(listing.category)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4 flex flex-col gap-2">
                        <p className="text-2xl font-black group-hover:text-[#1F2937] transition-colors">{voteCount}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleVote(listing.id);
                            }}
                            disabled={votedListings.has(listing.id)}
                            className={`text-sm font-bold px-3 py-1.5 border-2 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-1 justify-center flex-1 ${
                              votedListings.has(listing.id)
                                ? 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
                                : 'bg-white border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] text-white hover:text-[#1F2937]'
                            }`}
                          >
                            <Icons.Heart />
                            {votedListings.has(listing.id) ? 'Voted' : 'Vote'}
                          </button>
                          {!listing.isPremium && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedListingForPremium(listing);
                                setPremiumModalOpen(true);
                              }}
                              title="Make this listing premium"
                              className="text-sm font-bold px-2 py-1.5 bg-white border-2 border-[#FFB28F] text-[#FFB28F] hover:bg-blue-100 hover:text-[#1F2937] transition-all duration-200 hover:scale-110 active:scale-95"
                            >
                              ⭐
                            </button>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
            {listings.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  fetchListings(page);
                  document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-gray-50 py-12 border-b border-gray-200 fade-in">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Icons.Zap />
              <h2 className="text-2xl font-black text-[#1F2937] uppercase">How It Works</h2>
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
                    className="border-gray-300 border-4 p-8 bg-white text-center hover:bg-[#0F3460]/10 hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="flex justify-center mb-4 text-[#0F3460] text-4xl transition-colors">
                      <StepIcon />
                    </div>
                    <p className="text-4xl font-black text-[#0F3460] mb-2">{step.num}</p>
                    <h3 className="text-lg font-black text-[#1F2937] uppercase mb-2">{step.title}</h3>
                    <p className="text-sm text-[#1F2937]/70 font-semibold">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PREMIUM FEATURES SECTION */}
        <section className="bg-gradient-to-b from-[#F5F5F5] to-white py-20 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="text-5xl">💎</span>
              </div>
              <h2 className="text-4xl font-black text-[#1F2937] mb-4 uppercase">Premium Features</h2>
              <p className="text-lg text-[#1F2937]/70 max-w-2xl mx-auto">Boost your product visibility with guaranteed placement and founder spotlight</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  price: '$5',
                  title: 'Top Position',
                  description: 'Top spot on the leaderboard',
                  socialCount: 4,
                  features: [
                    'PREMIUM badge',
                    'Founder name display',
                    'Email (clickable)',
                    'Phone (clickable)',
                    '4 social accounts',
                    'Gradient card design',
                    'Vote count visible',
                    'Permanent placement',
                    'One-time payment'
                  ]
                },
                {
                  price: '$3',
                  title: 'Mid Position',
                  description: 'Second spot on the leaderboard',
                  socialCount: 1,
                  features: [
                    'PREMIUM badge',
                    'Founder name display',
                    'Email (clickable)',
                    'Phone (clickable)',
                    '1 social account',
                    'Gradient card design',
                    'Permanent placement',
                    'One-time payment'
                  ]
                },
                {
                  price: '$1',
                  title: 'Basic Position',
                  description: 'Third spot on the leaderboard',
                  socialCount: 0,
                  features: [
                    'PREMIUM badge',
                    'Founder name display',
                    'Email (clickable)',
                    'Phone (clickable)',
                    'Gradient card design',
                    'Permanent placement',
                    'One-time payment'
                  ]
                }
              ].map((plan, idx) => (
                <div
                  key={idx}
                  className={`shadow-sm border border-gray-200 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                    idx === 0 ? 'bg-gradient-to-br from-[#FFB28F] to-[#D97706] scale-105' : 'bg-white'
                  }`}
                >
                  {idx === 0 && (
                    <div className="inline-block mb-4 bg-[#18181B] text-[#FFB28F] px-4 py-2 border-2 border-[#FFB28F] font-black text-xs uppercase rounded">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-4">
                    <div className={`text-4xl font-black ${idx === 0 ? 'text-[#1F2937]' : 'text-[#1F2937]'}`}>
                      {plan.price}
                    </div>
                  </div>

                  <h3 className={`text-2xl font-black mb-2 uppercase ${idx === 0 ? 'text-[#1F2937]' : 'text-[#1F2937]'}`}>
                    {plan.title}
                  </h3>
                  <p className={`text-sm mb-6 font-semibold ${idx === 0 ? 'text-[#1F2937]/80' : 'text-[#1F2937]/70'}`}>
                    {plan.description}
                  </p>

                  <div className="space-y-2 py-6 border-t-3 border-b-3 border-gray-300/20 mb-6">
                    {plan.features.map((feature, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs font-bold ${idx === 0 ? 'text-[#1F2937]' : 'text-[#1F2937]'}`}>
                        <span className={`${idx === 0 ? 'text-[#1F2937]' : 'text-[#0F3460]'}`}>✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedListingForPremium(listings[0] || null);
                      setPremiumModalOpen(true);
                    }}
                    className={`w-full py-4 font-black uppercase text-sm border-4 hover:scale-105 active:scale-95 transition-all duration-200 ${
                      idx === 0
                        ? 'bg-[#18181B] text-[#FFB28F] border-gray-300'
                        : 'bg-[#0F3460] text-white border-[#0F3460]'
                    }`}
                  >
                    Get {plan.title}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center bg-blue-100 shadow-sm border border-gray-200 p-8 rounded-lg">
              <p className="text-lg font-black text-[#1F2937] mb-4">Ready to go premium?</p>
              <p className="text-sm text-[#1F2937]/80 mb-6 font-semibold">Submit your product for free, then click the ⭐ star button to upgrade to premium and boost your visibility!</p>
              <button
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-[#18181B] text-white font-black uppercase text-sm border-gray-300 border-4 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Submit Product Now
              </button>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-5xl font-black text-[#1F2937] mb-12 text-center uppercase tracking-tight">Trusted by builders worldwide</h2>
            <p className="text-center text-lg text-[#1F2937]/70 mb-16 max-w-2xl mx-auto">Founders, indie hackers and agencies ship on RankBid every day. Here is what they are saying, straight from X.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Sarah Chen',
                  handle: '@sarahchen',
                  text: 'Submitted our SaaS tool on RankBid and got 1,200 votes in the first week! The community voting is so transparent and fair. No algorithms hiding our product from users.',
                  image: '👩'
                },
                {
                  name: 'Alex Rodriguez',
                  handle: '@alexroddev',
                  text: 'Love how simple it is to submit and share. RankBid got my indie project discovered by thousands of users organically. The real-time rankings are addictive!',
                  image: '👨'
                },
                {
                  name: 'Emma Thompson',
                  handle: '@emmathompson',
                  text: 'Our AI tool ranked #1 in Developer category. The community-driven approach means quality products actually rise to the top. This is how discovery should work.',
                  image: '👩'
                },
                {
                  name: 'James Wilson',
                  handle: '@jameswilson',
                  text: 'Completely free to submit and compete on rankings. No gatekeepers, no algorithm black box. Just pure community voting power determining what gets seen.',
                  image: '👨'
                },
                {
                  name: 'Lisa Park',
                  handle: '@lisapark_',
                  text: 'The category filters and real-time updates make it perfect for finding what\'s trending. RankBid transformed how we discover new tools in our niche.',
                  image: '👩'
                },
                {
                  name: 'David Kumar',
                  handle: '@davidkumar',
                  text: 'Submitted 3 products and they all got amazing visibility. The community on RankBid actually votes on what they love. Finally a fair ranking platform!',
                  image: '👨'
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="p-6 border-3 border-gray-300 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div>
                      <p className="font-black text-[#1F2937]">{testimonial.name}</p>
                      <p className="text-sm text-[#1F2937]/60">{testimonial.handle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#1F2937] leading-relaxed">{testimonial.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-[#F5F5F4] border-t-4 border-gray-300">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-medium text-[#1F2937] mb-4 uppercase tracking-tight text-center">FAQS</h2>
            <p className="text-sm font-medium text-[#1F2937]/70 mb-12">Vote counts and community rankings are built into every submission, so discovery and engagement never leave the platform.</p>

            <div className="space-y-4">
              {[
                {
                  q: 'How does the voting system work?',
                  a: 'Users can vote on any submission they like. Each user gets one vote per submission. Vote counts are displayed in real-time and used to rank all submissions on the leaderboard.'
                },
                {
                  q: 'Can I submit my product for free?',
                  a: 'Yes! RankBid is completely free. Submit your product, share it with the community, and let the votes determine your ranking. No payment required.'
                },
                {
                  q: 'How are rankings determined?',
                  a: 'Rankings are determined entirely by community votes. The more votes your submission gets, the higher it ranks. We offer All-Time, Weekly, Monthly, and Today rankings.'
                },
                {
                  q: 'Can I search for specific products?',
                  a: 'Yes! Use the search box on the leaderboard to find products by name or description. You can also filter by category to narrow down results.'
                },
                {
                  q: 'How can I share my submission?',
                  a: 'Each submission has share buttons for Twitter (X), LinkedIn, and copy-to-clipboard. Share your product to get more community attention.'
                },
                {
                  q: 'Is there a leaderboard I can view?',
                  a: 'Yes! Our global leaderboard shows top-ranked submissions. You can view rankings by time period (Today, This Week, This Month, All Time) and filter by category.'
                },
                {
                  q: 'What categories are available?',
                  a: 'We have 30+ categories including Marketing, SEO, Productivity, Agents, Crypto, Developer, Health, Games, Business, E-commerce, Travel, and many more.'
                },
                {
                  q: 'Can I delete my submission?',
                  a: 'Contact our support team if you need to remove a submission. We\'re here to help keep the platform clean and legitimate.'
                }
              ].map((faq, idx) => (
                <FAQ key={idx} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* PREMIUM LISTING MODAL */}
      {selectedListingForPremium && (
        <PremiumListingModal
          listingId={selectedListingForPremium.id}
          listingTitle={selectedListingForPremium.title}
          isOpen={premiumModalOpen}
          onClose={() => {
            setPremiumModalOpen(false);
            setSelectedListingForPremium(null);
          }}
          onSubmit={handlePremiumSubmit}
        />
      )}

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 border-3 border-gray-300 font-bold text-sm animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-[#86EFAC] text-[#1F2937]'
                : toast.type === 'error'
                ? 'bg-red-100 text-red-700 border-red-400'
                : 'bg-white text-[#1F2937]'
            }`}
            style={{boxShadow: 'none'}}
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
