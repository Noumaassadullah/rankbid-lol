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
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  createdAt: string;
  imageUrl?: string;
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
    bidType: 'alltime' as 'alltime' | 'daily',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentBid, setCurrentBid] = useState(20);
  const [freeSpotAvailable, setFreeSpotAvailable] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(0);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataImage, setMetadataImage] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState('website');
  const [detectedCategory, setDetectedCategory] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD' | 'GBP' | 'INR'>('PKR');

  const PKR_RATE = 280; // 1 USD = 280 PKR
  const CURRENCY_RATES: { [key: string]: number } = {
    PKR: 1,
    USD: 280,
    GBP: 352,
    INR: 3.36,
  };

  const formatPrice = (amountInCents: number, currency: string = selectedCurrency): string => {
    const amountInPKR = (amountInCents / 100) * PKR_RATE;
    const rate = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
    const converted = amountInPKR / rate;

    const symbols: { [key: string]: string } = {
      PKR: '₨',
      USD: '$',
      GBP: '£',
      INR: '₹',
    };

    const symbol = symbols[currency] || '₨';
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  useEffect(() => {
    fetchListings();
    checkFreeSpots();
  }, [activeLeaderboard]);

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

  const checkFreeSpots = useCallback(async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=100');
      const data = await res.json();
      const listingCount = data.listings?.length || 0;
      const remaining = Math.max(0, 20 - listingCount);
      setSpotsRemaining(remaining);
      setFreeSpotAvailable(remaining > 0);
    } catch (error) {
      console.error('Error checking free spots:', error);
    }
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const sort = activeLeaderboard === 'today' ? 'dayPaid' : 'totalPaid';
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

      // First check if this would be a free user listing
      const checkRes = await fetch('/api/listings/submit?limit=100');
      const checkData = await checkRes.json();
      const listingCount = checkData.listings?.length || 0;
      const isFreeUser = listingCount < 20;

      // If free user, create listing immediately
      if (isFreeUser) {
        const res = await fetch('/api/listings/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setFormError('');
        setFormData({ url: '', handle: '', description: '', category: '', platform: 'website', bidType: 'alltime' });
        setMetadataImage(null);
        setDetectedPlatform('website');
        setDetectedCategory('');
        setFormLoading(false);
        alert('🎉 Congratulations! You are in the first 20 users!\n\nYour listing is now live and ranked #1 for FREE!');
        fetchListings();
        return;
      }

      // For paid users: skip listing creation and go directly to payment
      // Convert selected currency to PKR, then to USD cents for payment system
      const rate = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.PKR;
      const amountInPKR = currentBid * rate;
      const amountInCents = Math.round((amountInPKR / PKR_RATE) * 100);

      const checkoutRes = await fetch('/api/payment/jazzcash-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: { ...submitData, bidType: formData.bidType },
          amount: amountInCents,
          bidType: formData.bidType,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error);

      window.location.href = checkoutData.url;
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
      setFormLoading(false);
    }
  };

  const topListings = formData.bidType === 'daily'
    ? listings.slice(0, 10).sort((a, b) => b.dayPaid - a.dayPaid)
    : listings.slice(0, 10).sort((a, b) => b.totalPaid - a.totalPaid);

  const minBidForFirst = (() => {
    // Find first PAID user (not free user with bid=0)
    const paidListing = topListings.find(l => {
      const amount = formData.bidType === 'daily' ? l.dayPaid : l.totalPaid;
      return amount > 0;
    });

    if (paidListing) {
      // Show amount needed to beat current top paid user
      const topAmount = formData.bidType === 'daily' ? paidListing.dayPaid : paidListing.totalPaid;
      return Math.ceil(((topAmount / 100) / PKR_RATE) + 1);
    } else if (spotsRemaining <= 0) {
      // If no paid users yet but free spots are full, show minimum paid bid (₨100 / 280 cents)
      return Math.ceil((28000 / 100) / PKR_RATE);  // Minimum ₨100 to start paid bidding
    }
    return 20;
  })();

  const calculateRank = (bid: number) => {
    // Convert PKR bid to cents for comparison
    const bidInCents = Math.round((bid / PKR_RATE) * 100);
    const higherBids = topListings.filter(l => {
      const amount = formData.bidType === 'daily' ? l.dayPaid : l.totalPaid;
      return amount > bidInCents;
    }).length;
    return higherBids + 1;
  };

  const currentRank = calculateRank(currentBid);

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
                  Pure pay-to-rank competition. No algorithms. No politics. Just merit.
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
            {/* Free Spots Banner */}
            {freeSpotAvailable && (
              <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                <p className="text-center text-lg font-bold text-green-700">
                  🎁 {spotsRemaining} Free Spot{spotsRemaining !== 1 ? 's' : ''} Left - First 20 Users Get FREE Listing!
                </p>
              </div>
            )}

            {/* Bid Type Selector */}
            <div className="flex justify-center gap-3 mb-10">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bidType: 'alltime' }))}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  formData.bidType === 'alltime'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <span>🏆</span> All-time Ranking
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bidType: 'daily' }))}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  formData.bidType === 'daily'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full inline-block"></span> Today Only
              </button>
            </div>

            {/* Bid Type Info */}
            <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-gray-600">
                {formData.bidType === 'alltime'
                  ? "💰 All-time bid: Your payment adds to your permanent ranking and stays counted forever"
                  : "⏰ Today-only bid: Your payment counts only for today's rankings, resets at UTC midnight"}
              </p>
            </div>

            {/* Currency Selector */}
            <div className="flex justify-center gap-3 mb-12">
              {(['PKR', 'USD', 'GBP', 'INR'] as const).map(currency => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    selectedCurrency === currency
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            {/* Main Heading with Price */}
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                Claim #1 {formData.bidType === 'daily' ? 'Today' : ''} for <span className="text-green-500">{spotsRemaining > 0 ? 'FREE 🎁' : formatPrice(currentBid * 100)}</span>
              </h2>
              {spotsRemaining > 0 ? (
                <p className="text-sm text-gray-600 mt-2">
                  {spotsRemaining} free spot{spotsRemaining !== 1 ? 's' : ''} left! No payment needed for first 20 users
                </p>
              ) : (() => {
                const paidListing = topListings.find(l => {
                  const amount = formData.bidType === 'daily' ? l.dayPaid : l.totalPaid;
                  return amount > 0;
                });

                if (paidListing) {
                  const topAmount = formData.bidType === 'daily' ? paidListing.dayPaid : paidListing.totalPaid;
                  return (
                    <p className="text-sm text-gray-600 mt-2">
                      Top paid: {formatPrice(topAmount)} • Pay to rank higher
                    </p>
                  );
                } else if (topListings.length > 0) {
                  return (
                    <p className="text-sm text-gray-600 mt-2">
                      All current spots filled with free users • Pay any amount to rank at top
                    </p>
                  );
                }
                return null;
              })()}
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

            {/* Bid Amount Input - Show only during paid tier */}
            {spotsRemaining <= 0 && (
              <div className="flex justify-center items-center gap-6 pt-8 flex-col bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-xl border border-orange-200 max-w-2xl mx-auto">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Minimum Bid Amount to Get Your Listing</p>
                  <p className="text-3xl font-bold text-orange-600">{formatPrice(minBidForFirst * 100)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold block mb-3">Enter Your Bid Amount</label>
                  <input
                    type="number"
                    value={currentBid}
                    onChange={(e) => setCurrentBid(Math.max(minBidForFirst, parseInt(e.target.value) || minBidForFirst))}
                    min={minBidForFirst}
                    className="px-6 py-3 border-2 border-orange-300 rounded-lg text-center text-2xl font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 w-48"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">Enter at least {formatPrice(minBidForFirst * 100)} to rank your listing</p>
              </div>
            )}
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
                  const amount = activeLeaderboard === 'today' ? listing.dayPaid : listing.totalPaid;
                  const amountInPKR = (amount / 100) * PKR_RATE;
                  // To rank at this position, you need to bid ₨1 more than current amount (in PKR)
                  const bidToRank = Math.ceil(amountInPKR) + 1;

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
                              {listing.description.length > 80
                                ? listing.description.substring(0, 80) + '...'
                                : listing.description}
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

                        {/* Right Section - Price */}
                        {idx >= 20 ? (
                          <div className="text-right flex-shrink-0 pt-1">
                            <p className="text-xl font-black text-orange-600">
                              {formatPrice(amount)}
                            </p>
                          </div>
                        ) : (
                          <div className="text-right flex-shrink-0 pt-1">
                            <p className="text-sm font-semibold text-green-600">
                              FREE
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Hover Tooltip - Show bid amount only for paid listings (position 21+) */}
                      {idx >= 20 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {(() => {
                            const symbols: { [key: string]: string } = { PKR: '₨', USD: '$', GBP: '£', INR: '₹' };
                            const symbol = symbols[selectedCurrency] || '₨';
                            const bidInCurrency = bidToRank / CURRENCY_RATES[selectedCurrency];
                            return `Pay ${symbol}${Math.ceil(bidInCurrency).toLocaleString()} to rank here`;
                          })()}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-3 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
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
                { num: '2', title: 'Bid', desc: 'Place your bid to claim your rank' },
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
