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
  const [activeTimeFilter, setActiveTimeFilter] = useState<'alltime' | 'today'>('alltime');

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
        body: JSON.stringify({ listingId, voterId }),
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
      }
    } catch (error) {
      setVotedListings(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
      console.error('Error voting:', error);
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
      setDetectedPlatform('website');
      setDetectedCategory('');
      setFormLoading(false);
      alert('✅ Your submission is live!');
      fetchListings();
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
      setFormLoading(false);
    }
  };

  const topListings = activeTimeFilter === 'today'
    ? listings.slice(0, 10).sort((a, b) => b.dayVotes - a.dayVotes)
    : listings.slice(0, 10).sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <>
      <Header />
      <div className="bg-[#FFFFFF] text-[#18181B]">

        {/* HERO SECTION */}
        <section className="bg-white pt-8 pb-8 border-b-3 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold text-[#18181B] mb-3 uppercase tracking-wider border-l-3 border-[#FFB28F] pl-3">
                World Ranking Platform
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-[#18181B] mb-4 leading-snug">
                Rank Everything.
              </h1>
              <p className="text-base text-[#18181B]/75 mb-6 leading-relaxed font-medium">
                No algorithms. No gatekeepers. Pure community voting power. Submit your product and let the world decide.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2.5 bg-[#FFB28F] text-[#18181B] font-bold uppercase text-xs border-3 border-[#18181B] hover:bg-[#18181B] hover:text-[#FFB28F] transition-all duration-150"
                  style={{boxShadow: '-3px 3px 0px rgba(24,24,27,0.3)'}}
                >
                  Submit
                </button>
                <button
                  onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2.5 bg-white text-[#18181B] font-bold uppercase text-xs border-3 border-[#18181B] hover:bg-[#FFB28F] transition-all duration-150"
                  style={{boxShadow: '3px 3px 0px rgba(24,24,27,0.3)'}}
                >
                  Rankings
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="bg-[#F5F5F5] py-8 border-b-3 border-[#18181B]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-xl font-black text-[#18181B] mb-6 uppercase">Submit Your Product</h2>

            {/* Platform Selection */}
            <div className="flex flex-wrap gap-2 mb-6">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`px-3 py-1.5 font-bold text-xs uppercase border-2 transition-all ${
                    formData.platform === platform.id
                      ? 'bg-[#FFB28F] text-[#18181B] border-[#18181B]'
                      : 'bg-white text-[#18181B] border-[#18181B] hover:bg-[#FFB28F]'
                  }`}
                >
                  {platform.icon} {platform.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-100 border-2 border-red-400 text-red-700 text-sm font-bold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="url"
                  placeholder="Product URL or handle"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="px-4 py-2 bg-white text-[#18181B] border-2 border-[#18181B] font-semibold text-sm placeholder-gray-500 focus:outline-none"
                  required
                />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="px-4 py-2 bg-white text-[#18181B] border-2 border-[#18181B] font-semibold text-sm focus:outline-none"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={formLoading || metadataLoading}
                className="w-full px-6 py-2.5 bg-[#FFB28F] text-[#18181B] font-black uppercase text-sm border-3 border-[#18181B] hover:bg-[#18181B] hover:text-[#FFB28F] transition-all duration-150 disabled:opacity-50"
                style={{boxShadow: '-4px 4px 0px rgba(24,24,27,0.3)'}}
              >
                {formLoading ? 'Submitting...' : 'SUBMIT'}
              </button>
            </form>
          </div>
        </section>

        {/* LEADERBOARD SECTION */}
        <section id="leaderboard" className="bg-white py-8 border-b-3 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#18181B] uppercase">Top Rankings</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTimeFilter('alltime')}
                  className={`px-4 py-2 font-bold text-xs uppercase border-2 transition-all ${
                    activeTimeFilter === 'alltime'
                      ? 'bg-[#FFB28F] text-[#18181B] border-[#18181B]'
                      : 'bg-white text-[#18181B] border-[#18181B]'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setActiveTimeFilter('today')}
                  className={`px-4 py-2 font-bold text-xs uppercase border-2 transition-all ${
                    activeTimeFilter === 'today'
                      ? 'bg-[#FFB28F] text-[#18181B] border-[#18181B]'
                      : 'bg-white text-[#18181B] border-[#18181B]'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-[#18181B]/60 font-semibold">Loading rankings...</div>
            ) : topListings.length === 0 ? (
              <div className="text-center py-12 border-2 border-[#18181B] bg-[#F5F5F5]">
                <p className="text-sm font-bold text-[#18181B] mb-3">No rankings yet</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-4 py-2 bg-[#FFB28F] text-[#18181B] font-bold text-xs uppercase border-2 border-[#18181B]"
                >
                  Be First
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
                      className="flex items-center justify-between p-4 bg-[#F5F5F5] border-2 border-[#18181B] hover:bg-[#FFB28F] transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-lg font-black text-[#18181B]">#{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#18181B] truncate">{listing.title}</p>
                          {listing.category && (
                            <p className="text-xs text-[#18181B]/60 mt-1">{getCategoryLabel(listing.category)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-black text-[#FFB28F] group-hover:text-[#18181B]">{voteCount}</p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleVote(listing.id);
                          }}
                          disabled={votedListings.has(listing.id)}
                          className={`text-xs font-bold px-2 py-1 mt-2 border border-current ${
                            votedListings.has(listing.id)
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-white text-[#FFB28F] hover:bg-[#FFB28F] hover:text-white'
                          }`}
                        >
                          {votedListings.has(listing.id) ? '✓' : '👍'}
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
        <section className="bg-[#F5F5F5] py-8 border-b-3 border-[#18181B]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-black text-[#18181B] mb-6 uppercase">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { num: '1', title: 'Submit', desc: 'Add your product' },
                { num: '2', title: 'Vote', desc: 'Community votes' },
                { num: '3', title: 'Rank', desc: 'Climb rankings' }
              ].map((step, i) => (
                <div key={i} className="border-2 border-[#18181B] p-4 bg-white text-center hover:bg-[#FFB28F] transition-colors">
                  <p className="text-3xl font-black text-[#FFB28F] mb-2">{step.num}</p>
                  <h3 className="text-sm font-black text-[#18181B] uppercase mb-1">{step.title}</h3>
                  <p className="text-xs text-[#18181B]/70 font-semibold">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
