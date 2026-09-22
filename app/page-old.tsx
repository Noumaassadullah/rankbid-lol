'use client';

import Header from '@/components/Header';
import ShareButton from '@/components/ShareButton';
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
  { id: 'website', label: 'Website', icon: '🌐' },
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏' },
  { id: 'facebook', label: 'Facebook', icon: 'f' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' }
];

const getCategoryLabel = (categoryValue: string): string => {
  const category = CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState<'alltime' | 'today' | 'weekly' | 'monthly'>('alltime');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [trendingListings, setTrendingListings] = useState<Listing[]>([]);

  const [formData, setFormData] = useState({
    url: '',
    handle: '',
    description: '',
    category: '',
    platform: 'website',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataImage, setMetadataImage] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState('website');
  const [detectedCategory, setDetectedCategory] = useState('');
  const [votedListings, setVotedListings] = useState<Set<string>>(new Set());
  const [voterId, setVoterId] = useState<string>('');
  const [optimisticVotes, setOptimisticVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem('rankbid_voter_id');
    if (stored) {
      setVoterId(stored);
    } else {
      const newId = 'voter_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rankbid_voter_id', newId);
      setVoterId(newId);
    }
    const darkModePreference = localStorage.getItem('rankbid_dark_mode') === 'true';
    setDarkMode(darkModePreference);
    fetchListings();
  }, [activeTimeFilter]);

  const handleVote = useCallback(async (listingId: string) => {
    if (!voterId) {
      alert('Please wait for the page to load fully');
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
        body: JSON.stringify({
          listingId,
          voterId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
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
        alert('⚠️ You already voted for this listing');
      } else {
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
        alert('❌ ' + (data.error || 'Failed to vote'));
      }
    } catch (error) {
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
      console.error('Error voting:', error);
      alert('❌ Error: ' + String(error));
    }
  }, [voterId]);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (formData.url && formData.url.startsWith('http')) {
        setMetadataLoading(true);
        try {
          const res = await fetch(`/api/metadata?url=${encodeURIComponent(formData.url)}`);
          if (res.ok) {
            const data = await res.json();
            setDetectedPlatform(data.platform);
            setDetectedCategory(data.category);
            setMetadataImage(data.image);
            const detectedUrl = formData.url;
            const isFullUrl = detectedUrl.startsWith('http');
            if (isFullUrl) {
              setFormData(prev => ({
                ...prev,
                category: prev.category || data.category,
                platform: 'website'
              }));
            } else {
              setFormData(prev => ({ ...prev, category: prev.category || data.category, platform: data.platform }));
            }
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
        } finally {
          setMetadataLoading(false);
        }
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [formData.url]);


  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const sort = activeTimeFilter === 'today' ? 'dayVotes' : 'totalVotes';
      const res = await fetch(`/api/listings/submit?sort=${sort}&limit=100&timeFilter=${activeTimeFilter}`);

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

      // Get trending listings (top 3 from last 24h)
      const trendingRes = await fetch('/api/listings/submit?sort=dayVotes&limit=3&timeFilter=today');
      if (trendingRes.ok) {
        const trendingText = await trendingRes.text();
        if (trendingText) {
          const trendingData = JSON.parse(trendingText);
          setTrendingListings(trendingData.listings || []);
        }
      }
    } catch (error) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTimeFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.category) {
        setFormError('Please select a category');
        setFormLoading(false);
        return;
      }

      if (!formData.url && !formData.handle) {
        setFormError('Please enter a URL or handle');
        setFormLoading(false);
        return;
      }

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

      setFormError('');
      setFormData({ url: '', handle: '', description: '', category: '', platform: 'website' });
      setMetadataImage(null);
      setDetectedPlatform('website');
      setDetectedCategory('');
      setFormLoading(false);
      alert('✅ Your submission is live! The community will start voting now.');
      fetchListings();
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
      setFormLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchQuery === '' ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const topListings = activeTimeFilter === 'today'
    ? filteredListings.sort((a, b) => b.dayVotes - a.dayVotes).slice(0, 10)
    : filteredListings.sort((a, b) => b.totalVotes - a.totalVotes).slice(0, 10);

  return (
    <>
      <Header />
      <div className="bg-[#D8CDFF] text-[#18181B]">

        {/* NEO-BRUTALISM HERO */}
        <section className="bg-[#D8CDFF] pt-24 pb-20 md:pt-32 md:pb-28 border-b-8 border-[#18181B] relative overflow-hidden">
          <div className="absolute top-10 right-20 w-72 h-72 bg-[#FFB28F] opacity-20 transform -rotate-12 -z-10"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#86EFAC] opacity-10 transform rotate-45 -z-10"></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="mb-20">
              <p className="text-sm font-black text-[#18181B] mb-8 uppercase tracking-[0.3em] border-l-8 border-[#FFB28F] pl-6 transform -skew-x-12 hover:skew-x-0 transition-transform duration-300">
                ➤ The World Ranking Platform
              </p>

              <h1 className="text-7xl md:text-9xl font-black text-[#18181B] mb-10 leading-[0.9] tracking-tighter transform -skew-y-2 drop-shadow-2xl" style={{textShadow: '8px 8px 0px rgba(24,24,27,0.15)'}}>
                RANK<br />EVERYTHING
              </h1>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
                <div className="max-w-2xl">
                  <p className="text-lg md:text-xl text-[#18181B] mb-8 font-bold leading-relaxed">
                    No algorithms. No gatekeepers. Pure community voting. Your product deserves to be seen by the world.
                  </p>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="border-l-4 border-[#18181B] pl-4">
                      <p className="text-2xl font-black text-[#18181B]">100K+</p>
                      <p className="text-sm text-[#18181B]/70">Products Ranked</p>
                    </div>
                    <div className="border-l-4 border-[#18181B] pl-4">
                      <p className="text-2xl font-black text-[#18181B]">50+</p>
                      <p className="text-sm text-[#18181B]/70">Categories</p>
                    </div>
                    <div className="border-l-4 border-[#18181B] pl-4">
                      <p className="text-2xl font-black text-[#18181B]">Transparent</p>
                      <p className="text-sm text-[#18181B]/70">Voting</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 flex-col sm:flex-row">
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group px-8 py-4 bg-[#FFB28F] text-[#18181B] font-black uppercase text-sm border-6 border-[#18181B] hover:translate-x-1 hover:translate-y-1 transition-all duration-150 tracking-wider relative transform -rotate-1 hover:rotate-0 active:scale-95"
                    style={{boxShadow: '-6px 6px 0px rgba(24,24,27,0.4), -12px 12px 0px rgba(24,24,27,0.2)'}}
                  >
                    SUBMIT NOW
                  </button>
                  <button
                    onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group px-8 py-4 bg-[#FFFFFF] text-[#18181B] font-black uppercase text-sm border-6 border-[#18181B] hover:translate-x-1 hover:translate-y-1 transition-all duration-150 tracking-wider relative transform rotate-1 hover:rotate-0 active:scale-95"
                    style={{boxShadow: '6px 6px 0px rgba(24,24,27,0.4), 12px 12px 0px rgba(24,24,27,0.2)'}}
                  >
                    VIEW RANKINGS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="bg-[#D8CDFF] py-20 border-b-8 border-[#18181B] relative">
          <div className="absolute top-20 left-0 w-64 h-64 bg-[#86EFAC] opacity-15 transform -rotate-45 -z-10"></div>
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-[#18181B] mb-16 uppercase tracking-tight transform -skew-y-2" style={{textShadow: '6px 6px 0px rgba(24,24,27,0.1)'}}>Why RankBid?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'REAL VOTING', desc: 'No paid rankings. No manipulation. Pure community power.', icon: '🗳️' },
                { title: 'GLOBAL REACH', desc: 'Reach millions of makers and decision-makers worldwide.', icon: '🌍' },
                { title: 'INSTANT RESULTS', desc: 'Live updates. Real-time voting. See impact immediately.', icon: '⚡' },
                { title: 'FREE FOREVER', desc: 'Zero fees. Zero hidden costs. Just pure ranking.', icon: '🆓' }
              ].map((benefit, i) => (
                <div key={i}
                  className="border-6 border-[#18181B] p-8 bg-[#FFFFFF] hover:bg-[#FFB28F] transition-all duration-300 group transform hover:scale-105 hover:-rotate-1 relative cursor-pointer"
                  style={{boxShadow: `${i % 2 === 0 ? '-8px 8px' : '8px 8px'} 0px rgba(24,24,27,0.3)`}}
                >
                  <div className="absolute -top-6 -right-6 text-5xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:rotate-12">{benefit.icon}</div>
                  <h3 className="text-2xl font-black uppercase tracking-wider mb-3 text-[#18181B] group-hover:text-[#18181B]">{benefit.title}</h3>
                  <p className="text-lg font-semibold leading-relaxed text-[#18181B]">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBMISSION FORM */}
        <section className="bg-[#D8CDFF] py-20 border-b-8 border-[#18181B] relative overflow-hidden">
          <div className="absolute -top-20 right-0 w-80 h-80 bg-[#FFB28F] opacity-20 transform rotate-45 -z-10"></div>
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <h2 className="text-6xl md:text-7xl font-black text-[#18181B] mb-4 uppercase tracking-tight transform -skew-y-2" style={{textShadow: '8px 8px 0px rgba(24,24,27,0.15)'}}>
              CLAIM YOUR RANK
            </h2>
            <p className="text-xl text-gray-300 mb-12 font-bold">
              Submit your product. Let the world vote.
            </p>

            {/* Platform Selection */}
            <div className="flex flex-wrap gap-3 mb-12">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`px-6 py-3 font-black uppercase text-sm tracking-wider transition-all border-2 ${
                    formData.platform === platform.id
                      ? 'bg-[#FFFFFF] text-[#18181B] border-[#18181B]'
                      : 'bg-[#D8CDFF] text-[#18181B] border-[#18181B] hover:bg-[#FFFFFF] hover:text-[#18181B]'
                  }`}
                >
                  {platform.icon} {platform.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {formError && (
                <div className="p-6 bg-red-600 border-4 border-[#18181B] text-[#18181B] font-bold uppercase">
                  {formError}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="url"
                  placeholder={formData.platform === 'website' ? 'Your product URL' : 'Your @handle or page link'}
                  value={formData.url}
                  onChange={handleInputChange}
                  className="px-6 py-4 bg-[#FFFFFF] text-[#18181B] border-4 border-[#18181B] font-bold placeholder-gray-600 focus:outline-none focus:ring-0"
                  required
                />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="px-6 py-4 bg-[#FFFFFF] text-[#18181B] border-4 border-[#18181B] font-bold focus:outline-none focus:ring-0"
                  required
                >
                  <option value="">Choose a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={formLoading || metadataLoading}
                  className="w-full px-8 py-5 bg-[#FFB28F] text-[#18181B] font-black uppercase border-6 border-[#18181B] hover:translate-x-2 hover:translate-y-2 transition-all duration-150 text-lg tracking-wider disabled:opacity-50 active:scale-95 transform hover:-rotate-1"
                  style={{boxShadow: '-8px 8px 0px rgba(24,24,27,0.4), -16px 16px 0px rgba(24,24,27,0.2)'}}
                >
                  {formLoading ? 'PROCESSING...' : metadataLoading ? 'LOADING...' : 'SUBMIT RANKING'}
                </button>
              </div>

              <textarea
                name="description"
                placeholder="Brief description"
                value={formData.description}
                onChange={handleInputChange}
                rows={1}
                className="hidden"
              />
            </form>
          </div>
        </section>

        {/* LEADERBOARD */}
        <section id="leaderboard" className="bg-[#D8CDFF] py-20 border-b-8 border-[#18181B] relative">
          <div className="absolute top-32 right-20 w-72 h-72 bg-[#86EFAC] opacity-15 transform rotate-12 -z-10"></div>
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <h2 className="text-6xl font-black text-[#18181B] mb-12 uppercase tracking-tight transform -skew-y-2" style={{textShadow: '6px 6px 0px rgba(24,24,27,0.1)'}}>GLOBAL RANKINGS</h2>

            {/* Search & Category Filters */}
            <div className="flex flex-col gap-4 mb-12">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-6 py-3 bg-[#FFFFFF] text-[#18181B] border-4 border-[#18181B] font-bold uppercase placeholder-gray-400 focus:outline-none focus:bg-[#D8CDFF] focus:text-[#18181B] transition-all"
              />
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="px-6 py-3 bg-[#FFFFFF] text-[#18181B] border-4 border-[#18181B] font-bold uppercase focus:outline-none focus:bg-[#D8CDFF] focus:text-[#18181B] transition-all"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Trending Section */}
            {trendingListings.length > 0 && (
              <div className="mb-12 p-6 bg-[#FFFFFF] border-4 border-[#18181B]">
                <h3 className="text-2xl font-black text-[#18181B] mb-6 uppercase">🔥 Trending Now</h3>
                <div className="space-y-3">
                  {trendingListings.map((listing, idx) => (
                    <div key={listing.id} className="flex items-center justify-between">
                      <span className="text-lg font-black text-[#18181B]">#{idx + 1} {listing.title}</span>
                      <span className="font-bold">{listing.dayVotes} votes today</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-12 pb-6 border-b-4 border-[#18181B] overflow-x-auto">
              <button
                onClick={() => setActiveTimeFilter('today')}
                className={`px-6 py-3 font-black uppercase text-sm tracking-wider transition-all whitespace-nowrap ${
                  activeTimeFilter === 'today'
                    ? 'bg-[#FFFFFF] text-[#18181B]'
                    : 'text-[#18181B] hover:text-[#FFB28F]'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTimeFilter('weekly')}
                className={`px-6 py-3 font-black uppercase text-sm tracking-wider transition-all whitespace-nowrap ${
                  activeTimeFilter === 'weekly'
                    ? 'bg-[#FFFFFF] text-[#18181B]'
                    : 'text-[#18181B] hover:text-[#FFB28F]'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setActiveTimeFilter('monthly')}
                className={`px-6 py-3 font-black uppercase text-sm tracking-wider transition-all whitespace-nowrap ${
                  activeTimeFilter === 'monthly'
                    ? 'bg-[#FFFFFF] text-[#18181B]'
                    : 'text-[#18181B] hover:text-[#FFB28F]'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setActiveTimeFilter('alltime')}
                className={`px-6 py-3 font-black uppercase text-sm tracking-wider transition-all whitespace-nowrap ${
                  activeTimeFilter === 'alltime'
                    ? 'bg-[#FFFFFF] text-[#18181B]'
                    : 'text-[#18181B] hover:text-[#FFB28F]'
                }`}
              >
                All Time
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[#18181B]/70 font-bold text-lg">Loading rankings...</div>
            ) : topListings.length === 0 ? (
              <div className="text-center py-20 border-4 border-[#18181B]">
                <p className="text-3xl font-black text-[#18181B] mb-6 uppercase">Be First to Rank</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-[#FFFFFF] text-[#18181B] font-black uppercase border-4 border-[#18181B] hover:bg-[#D8CDFF] hover:text-[#18181B] transition-all"
                >
                  Submit Your Product
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {topListings.map((listing, idx) => {
                  const baseVoteCount = activeTimeFilter === 'today' ? listing.dayVotes : listing.totalVotes;
                  const voteCount = (optimisticVotes[listing.id] || 0) + baseVoteCount;

                  const getPlatformInfo = (url: string): { platform: string; displayName: string } => {
                    try {
                      const urlObj = new URL(listing.url || url);
                      const hostname = urlObj.hostname.toLowerCase();
                      const pathname = urlObj.pathname.toLowerCase();

                      if (hostname.includes('instagram.com')) {
                        const usernameMatch = pathname.match(/\/?@?([a-z0-9._]+)/i);
                        const username = usernameMatch?.[1] || listing.title.split(' ')[0];
                        return { platform: 'instagram', displayName: username };
                      } else if (hostname.includes('linkedin.com')) {
                        const parts = listing.title.split(' ');
                        return { platform: 'linkedin', displayName: parts[0] };
                      } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
                        const usernameMatch = pathname.match(/\/?@?([a-z0-9_]+)/i);
                        const username = usernameMatch?.[1] || listing.title.split(' ')[0];
                        return { platform: 'twitter', displayName: username };
                      } else if (hostname.includes('facebook.com')) {
                        return { platform: 'facebook', displayName: listing.title.split(' ')[0] };
                      } else if (hostname.includes('tiktok.com')) {
                        const usernameMatch = pathname.match(/\/?@?([a-z0-9._]+)/i);
                        const username = usernameMatch?.[1] || listing.title.split(' ')[0];
                        return { platform: 'tiktok', displayName: username };
                      } else {
                        const parts = hostname.replace('www.', '').split('.');
                        const name = parts[0];
                        return { platform: 'website', displayName: name.charAt(0).toUpperCase() + name.slice(1) };
                      }
                    } catch {
                      return { platform: 'website', displayName: listing.title.split(' ')[0] };
                    }
                  };

                  const { platform, displayName } = getPlatformInfo(listing.url || listing.title);

                  return (
                    <a
                      key={listing.id}
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group"
                    >
                      <div className="bg-[#D8CDFF] border-4 border-[#18181B] p-6 flex items-start justify-between hover:bg-[#FFFFFF] hover:text-[#18181B] transition-all duration-200 cursor-pointer">
                        <div className="flex-1 flex items-start gap-6">
                          <div className="text-5xl font-black text-[#18181B] group-hover:text-[#18181B] flex-shrink-0">#{idx + 1}</div>

                          {listing.imageUrl ? (
                            <img
                              src={listing.imageUrl}
                              alt={displayName}
                              className="w-16 h-16 object-cover border-2 border-[#18181B] flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-[#FFFFFF] text-[#18181B] flex items-center justify-center font-black text-2xl border-2 border-[#18181B] flex-shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="font-black text-lg uppercase tracking-wide mb-2">
                              {platform === 'instagram' ? `@${displayName}` : displayName}
                            </h3>
                            {listing.description && (
                              <p className="text-sm font-semibold mb-3 line-clamp-2">
                                {listing.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              {listing.category && (
                                <span className="inline-flex items-center px-3 py-1 border-2 border-current font-bold text-xs uppercase">
                                  {getCategoryLabel(listing.category)}
                                </span>
                              )}
                              <span className="text-xs font-bold opacity-70">
                                {new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-3">
                          <p className="text-4xl font-black">
                            {voteCount}
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleVote(listing.id);
                            }}
                            disabled={votedListings.has(listing.id)}
                            className={`px-4 py-2 font-black uppercase text-xs border-2 transition-all ${
                              votedListings.has(listing.id)
                                ? 'bg-gray-600 text-[#18181B] border-gray-600 cursor-not-allowed'
                                : 'bg-[#FFFFFF] text-[#18181B] border-[#18181B] hover:bg-[#D8CDFF] hover:text-[#18181B] hover:border-[#18181B]'
                            }`}
                          >
                            {votedListings.has(listing.id) ? '✓ VOTED' : '👍 VOTE'}
                          </button>
                          <div onClick={(e) => e.preventDefault()} className="border-t-2 border-current pt-3 mt-3">
                            <ShareButton url={listing.url} title={listing.title} />
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS - NEO-BRUTALISM */}
        <section className="py-20 bg-[#D8CDFF] border-b-8 border-[#18181B] relative overflow-hidden">
          <div className="absolute -bottom-20 left-10 w-96 h-96 bg-[#FFB28F] opacity-15 transform -rotate-45 -z-10"></div>
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <h2 className="text-6xl font-black text-[#18181B] mb-16 uppercase tracking-tight transform -skew-y-2" style={{textShadow: '6px 6px 0px rgba(24,24,27,0.1)'}}>THE SYSTEM</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '01', title: 'SUBMIT', desc: 'Add your product URL or social media', icon: '📤' },
                { num: '02', title: 'VOTE', desc: 'Global community votes in real-time', icon: '🗳️' },
                { num: '03', title: 'DOMINATE', desc: 'Climb the world rankings', icon: '🏆' }
              ].map((step, i) => (
                <div key={i}
                  className="border-6 border-[#18181B] p-8 bg-[#FFFFFF] transform hover:scale-110 hover:-rotate-2 transition-all duration-300 group relative cursor-pointer"
                  style={{boxShadow: `${i === 1 ? '0px 12px' : i === 0 ? '-12px 12px' : '12px 12px'} 0px rgba(24,24,27,0.3)`}}
                >
                  <div className="absolute -top-8 -right-8 text-5xl opacity-40 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-125 group-hover:rotate-12">{step.icon}</div>
                  <p className="text-7xl font-black text-[#FFB28F] mb-2 tracking-tighter">{step.num}</p>
                  <h3 className="text-2xl font-black text-[#18181B] uppercase mb-3 tracking-wider">{step.title}</h3>
                  <p className="text-base font-semibold text-[#18181B]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
