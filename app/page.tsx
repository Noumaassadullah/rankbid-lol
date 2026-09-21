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
  { value: 'Technology', label: 'Technology' },
  { value: 'ECommerce', label: 'E-Commerce' },
  { value: 'DigitalMarketing', label: 'Digital Marketing' },
  { value: 'Education', label: 'Education' },
  { value: 'Health', label: 'Health' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Food', label: 'Food' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Business', label: 'Business' },
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
  const [activeLeaderboard, setActiveLeaderboard] = useState<'alltime' | 'today'>('alltime');

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

  useEffect(() => {
    // Initialize voter ID from localStorage
    const stored = localStorage.getItem('rankbid_voter_id');
    if (stored) {
      setVoterId(stored);
    } else {
      const newId = 'voter_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rankbid_voter_id', newId);
      setVoterId(newId);
    }
    fetchListings();
  }, [activeLeaderboard]);

  const handleVote = useCallback(async (listingId: string) => {
    if (!voterId) return;

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          voterId,
        }),
      });

      if (res.ok) {
        setVotedListings(prev => new Set([...prev, listingId]));
        fetchListings();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  }, [voterId]);

  // Auto-detect platform and category from URL
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
            // Auto-update platform based on detected URL
            // For LinkedIn, Twitter, Facebook, Instagram, TikTok - set to 'website' since they handle full URLs
            // This ensures the URL is used as-is, not reconstructed
            const detectedUrl = formData.url;
            const isFullUrl = detectedUrl.startsWith('http');
            if (isFullUrl) {
              setFormData(prev => ({
                ...prev,
                category: prev.category || data.category,
                platform: 'website' // Use 'website' platform for full URLs to preserve them as-is
              }));
            } else {
              // Handle is just a username, use detected platform
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
      const sort = activeLeaderboard === 'today' ? 'dayVotes' : 'totalVotes';
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
  }, [activeLeaderboard]);

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

      // Prepare data for submission
      const submitData = {
        url: formData.platform === 'website' ? formData.url : undefined,
        handle: formData.platform !== 'website' ? (formData.url || formData.handle) : undefined,
        description: formData.description,
        category: formData.category,
        platform: formData.platform,
      };

      // Submit listing directly (no payment needed)
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

  const topListings = activeLeaderboard === 'today'
    ? listings.slice(0, 10).sort((a, b) => b.dayVotes - a.dayVotes)
    : listings.slice(0, 10).sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <>
      <Header />
      <div className="bg-white">

        {/* HERO */}
        <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-5xl mx-auto px-6">
            {/* Main Content */}
            <div className="mb-20">
              <p className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wider">The Transparent Leaderboard</p>

              <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight">
                Rank Your<br />Product
              </h1>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium">
                  Community-ranked leaderboards. No algorithms. No politics. Pure voting.
                </p>

                <div className="flex gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    Start Ranking
                  </button>
                  <button
                    onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3 bg-white text-gray-900 font-bold border-2 border-gray-300 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FORM SECTION */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                Share Your Product
              </h2>
              <p className="text-lg text-gray-600 mt-4">
                Submit for free and let the community vote it up
              </p>
            </div>

            {/* Platform Selection */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    formData.platform === platform.id
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {platform.icon} {platform.label}
                </button>
              ))}
            </div>

            {/* Detected Platform Info */}
            {detectedPlatform && detectedCategory && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg flex items-center gap-4 max-w-2xl mx-auto">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Detected:</span> {detectedPlatform === 'website' ? '🌐' : ''}{detectedPlatform === 'linkedin' ? '🔗' : ''}{detectedPlatform === 'twitter' ? '𝕏' : ''}{detectedPlatform === 'facebook' ? 'f' : ''} {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)} • {getCategoryLabel(detectedCategory)}
                  </p>
                </div>
              </div>
            )}

            {/* Compact Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-12">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium w-full">
                  {formError}
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                {/* URL Input */}
                <input
                  type="text"
                  name="url"
                  placeholder={formData.platform === 'website' ? 'Your product URL' : 'Your @handle or page link'}
                  value={formData.url}
                  onChange={handleInputChange}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  required
                />

                {/* Category Select */}
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Choose a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formLoading || metadataLoading}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 whitespace-nowrap shadow-lg hover:shadow-2xl hover:scale-105"
                >
                  {formLoading ? 'Processing...' : metadataLoading ? 'Loading...' : 'Claim Rank'}
                </button>
              </div>

              {/* Hidden Description Field */}
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
        <section id="leaderboard" className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Rankings</h2>

            {/* Time Filter Tabs */}
            <div className="flex gap-4 justify-center mb-8 border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveLeaderboard('alltime')}
                className={`px-6 py-2 font-semibold transition-colors ${activeLeaderboard === 'alltime' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All Time
              </button>
              <button
                onClick={() => setActiveLeaderboard('today')}
                className={`px-6 py-2 font-semibold transition-colors ${activeLeaderboard === 'today' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Today
              </button>
            </div>


            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading rankings...</div>
            ) : topListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900 mb-4">No listings yet</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Be First to List
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {topListings.map((listing, idx) => {
                  const voteCount = activeLeaderboard === 'today' ? listing.dayVotes : listing.totalVotes;

                  // Extract platform and format display
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
                      <div className="bg-white rounded-lg px-3 py-[5px] my-[5px] flex items-start justify-between hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer border border-gray-100 hover:border-orange-300 gap-3">
                        {/* Rank Number */}
                        <div className="text-base font-black text-orange-500 flex-shrink-0 pt-1 min-w-fit">#{idx + 1}</div>

                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {listing.imageUrl ? (
                            <img
                              src={listing.imageUrl}
                              alt={displayName}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('hidden');
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                              {displayName.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Left Section - Title, Description, Meta */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-normal text-gray-900 text-xs group-hover:text-orange-600 transition-colors line-clamp-1 mb-1" style={{fontWeight: '400', fontSize: '12px'}}>
                            {platform === 'instagram' ? `@${displayName}` : displayName}
                          </h3>
                          {listing.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {listing.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {listing.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {getCategoryLabel(listing.category)}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{listing.clickCount.toLocaleString()} clicks</span>
                          </div>
                        </div>

                        {/* Right Section - Votes */}
                        <div className="text-right flex-shrink-0 pt-1 flex flex-col items-end gap-2">
                          <p className="text-xl font-black text-orange-600">
                            {voteCount} vote{voteCount !== 1 ? 's' : ''}
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleVote(listing.id);
                            }}
                            disabled={votedListings.has(listing.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                              votedListings.has(listing.id)
                                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200 active:scale-95'
                            }`}
                          >
                            {votedListings.has(listing.id) ? '✓ Voted' : '👍 Vote'}
                          </button>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Submit', desc: 'Add your product URL or social media handle' },
                { num: '2', title: 'Vote', desc: 'Community votes to rank your listing higher' },
                { num: '3', title: 'Dominate', desc: 'Get discovered by real makers' }
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-orange-600">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </div>
    </>
  );
}
