'use client';

import Header from '@/components/Header';
import FAQ from '@/components/FAQ';
import Pagination from '@/components/Pagination';
import PlatformIcon from '@/components/PlatformIcon';
import PremiumListingCard from '@/components/PremiumListingCard';
import PremiumListingModal from '@/components/PremiumListingModal';
import LoginModal from '@/components/LoginModal';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
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
  { id: 'linkedin', label: 'LinkedIn' },
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
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
};

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState<'alltime' | 'today'>('alltime');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedListingForPremium, setSelectedListingForPremium] = useState<Listing | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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
  const [lastSubmittedProduct, setLastSubmittedProduct] = useState<{ id: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

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

    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    setCurrentPage(1);
    fetchListings(1);
  }, [activeTimeFilter, selectedCategory]);

  const handleVote = useCallback(async (listingId: string) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

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
        body: JSON.stringify({ listingId, voterId, userId: user.id }),
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

    if (!user) {
      setLoginModalOpen(true);
      return;
    }

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
        userId: user.id,
      };

      const authToken = localStorage.getItem('auth_token');
      const res = await fetch('/api/listings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const displayName = data.displayHandle ? `@${data.displayHandle}` : 'Your product';
      addToast(`🎉 ${displayName} is live! Community voting starts now.`, 'success');
      setLastSubmittedProduct({ id: data.id, title: displayName });
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

  const handleShareTwitter = () => {
    if (!lastSubmittedProduct) return;
    const productUrl = `https://rankbid-lol.vercel.app/product/${lastSubmittedProduct.id}`;
    const text = `Just submitted ${lastSubmittedProduct.title} on RankBid! 🚀 Vote for my product and help it climb the global rankings. No algorithms, just pure community voting. #RankBid`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    if (!lastSubmittedProduct) return;
    const productUrl = `https://rankbid-lol.vercel.app/product/${lastSubmittedProduct.id}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const handleCopyLink = async () => {
    if (!lastSubmittedProduct) return;
    const productUrl = `https://rankbid-lol.vercel.app/product/${lastSubmittedProduct.id}`;
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      addToast('Failed to copy link', 'error');
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
        <section className="bg-white pt-8 md:pt-16 pb-8 md:pb-16 border-b border-gray-200 relative overflow-hidden fade-in">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F3460] text-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#059669] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left Content */}
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-6xl font-black text-[#1F2937] mb-4 md:mb-6 leading-tight">
                  Rank Everything.
                </h1>

                <p className="text-base md:text-lg text-[#1F2937]/75 mb-6 md:mb-8 leading-relaxed font-medium">
                  No algorithms. No gatekeepers. Pure community voting power. Let the world discover your product through transparent, democratic rankings.
                </p>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
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
                <div className="flex gap-2 md:gap-4 flex-wrap">
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-4 md:px-8 py-2 md:py-4 bg-[#0F3460] text-white font-black uppercase text-xs md:text-sm border-[#0F3460] border-2 md:border-4 hover:scale-105 active:scale-95 transition-all duration-150"
                    style={{boxShadow: 'none'}}
                  >
                    <Icons.Upload />
                    Submit Now
                  </button>
                  <button
                    onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-4 md:px-8 py-2 md:py-4 bg-white text-[#1F2937] font-black uppercase text-xs md:text-sm border-gray-300 border-2 md:border-4 hover:scale-105 active:scale-95 transition-all duration-150"
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
        <section className="bg-gray-50 py-6 md:py-12 border-b border-gray-200 fade-in">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            {!user ? (
              <div className="mb-8 p-6 md:p-8 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                <p className="text-lg font-bold text-[#1F2937] mb-4">Login Required to Submit</p>
                <p className="text-sm text-[#1F2937]/70 mb-6">You need to be logged in to submit your product and vote.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a
                    href="/login"
                    className="px-6 py-3 bg-[#0F3460] text-white font-bold rounded-lg hover:bg-[#0D2A50] transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="px-6 py-3 bg-white text-[#0F3460] font-bold border-2 border-[#0F3460] rounded-lg hover:bg-[#0F3460]/5 transition-colors"
                  >
                    Create Account
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <Icons.Upload />
                  <h2 className="text-lg md:text-2xl font-black text-[#1F2937]">Submit Your Product</h2>
                </div>

            {/* Platform Selection */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`px-4 py-2 font-bold text-xs rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                    formData.platform === platform.id
                      ? 'bg-orange-100 text-[#1F2937] border border-gray-300'
                      : 'bg-white text-[#1F2937] border border-gray-300 hover:bg-orange-100'
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
                    placeholder={formData.platform === 'website' ? 'Product URL' : 'Full profile URL'}
                    value={formData.url}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white text-[#1F2937] border border-gray-300 font-semibold text-sm rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ${
                      formErrors.url ? 'border-red-500 shake' : ''
                    }`}
                    required
                  />
                  {formErrors.url && (
                    <p className="text-xs text-red-600 font-bold mt-1 slide-in">{formErrors.url}</p>
                  )}
                  {formData.platform !== 'website' && (
                    <p className="text-xs text-[#1F2937]/60 font-semibold mt-1">
                      {formData.platform === 'facebook' && 'e.g., https://facebook.com/yourpage'}
                      {formData.platform === 'instagram' && 'e.g., https://instagram.com/username'}
                      {formData.platform === 'tiktok' && 'e.g., https://tiktok.com/@username'}
                      {formData.platform === 'linkedin' && 'e.g., https://linkedin.com/in/yourprofile'}
                      {['twitter', 'x'].includes(formData.platform) && 'e.g., https://twitter.com/username'}
                    </p>
                  )}
                </div>

                <div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white text-[#1F2937] border border-gray-300 font-semibold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ${
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
                className="w-full px-6 py-4 bg-[#0F3460] text-white font-semibold text-sm rounded-lg hover:bg-[#0D2A50] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
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

            {/* Share Buttons - Show after successful submission */}
            {lastSubmittedProduct && (
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg fade-in">
                <h3 className="text-lg font-bold text-[#1F2937] mb-4">🎉 Your product is live!</h3>
                <p className="text-sm text-[#1F2937]/70 mb-4">Share your submission link to get votes:</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                    </svg>
                    Share on X
                  </button>

                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    Share on LinkedIn
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold text-sm"
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setLastSubmittedProduct(null)}
                  className="mt-4 text-sm text-[#1F2937]/60 hover:text-[#1F2937] font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}
              </>
            )}
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
                    className={`px-4 py-2 font-bold text-xs rounded-lg shadow-sm transition-all duration-200 ${
                      activeTimeFilter === filter
                        ? 'bg-[#0F3460] text-white shadow-md ring-2 ring-[#0F3460] ring-offset-2'
                        : 'bg-white text-[#1F2937] border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter === 'alltime' ? 'All Time' : 'Today'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter moved to header navigation */}

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
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md hover:border-[#0F3460]/20 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-[#0F3460] text-white font-semibold text-xs rounded-lg flex items-center justify-center flex-shrink-0">#{(currentPage - 1) * 15 + idx + 1}</div>
                        <img src={faviconUrl} alt="favicon" className="w-6 h-6 rounded-md flex-shrink-0" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'; }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-[#1F2937] truncate">{listing.title}</p>
                            <div className="w-4 h-4 flex-shrink-0" title={platformLabel}>
                              <PlatformIcon platform={platformLabel} size={16} />
                            </div>
                          </div>
                          {listing.category && (
                            <p className="text-xs text-[#1F2937]/60 mt-0.5 flex items-center gap-1">
                              <Icons.Tag />
                              {getCategoryLabel(listing.category)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3 flex flex-col items-center gap-2">
                        <p className="text-lg font-black text-[#0F3460] group-hover:text-[#0D2A50] transition-colors">{voteCount}</p>
                        <div className="flex gap-1 w-full">
                          {user ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleVote(listing.id);
                              }}
                              disabled={votedListings.has(listing.id)}
                              className={`text-xs font-semibold px-2 py-1 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1 justify-center whitespace-nowrap ${
                                votedListings.has(listing.id)
                                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                  : 'bg-white border border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white'
                              }`}
                            >
                              <Icons.Heart />
                              {votedListings.has(listing.id) ? 'Voted' : 'Vote'}
                            </button>
                          ) : (
                            <a
                              href="/login"
                              className="text-xs font-semibold px-2 py-1 rounded-lg bg-white border border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all duration-200 flex items-center gap-1 justify-center whitespace-nowrap"
                            >
                              <Icons.Heart />
                              Login to Vote
                            </a>
                          )}
                          {!listing.isPremium && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedListingForPremium(listing);
                                setPremiumModalOpen(true);
                              }}
                              title="Make this listing premium"
                              className="text-xs font-semibold px-2 py-1 bg-white border border-gray-300 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                            >
                              ⭐ Premium
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

        {/* TOP RANKINGS BY SOCIAL PLATFORM */}
        <section className="bg-gradient-to-b from-white via-blue-50 to-white py-8 md:py-16 border-b border-gray-200 fade-in relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-10 w-64 h-64 bg-[#0F3460] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-10 w-64 h-64 bg-[#059669] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-8 md:mb-16">
              <div className="inline-flex items-center gap-2 mb-3 md:mb-4 px-4 py-2 bg-[#0F3460]/10 border border-[#0F3460]/20 rounded-full">
                <Icons.TrendingUp />
                <span className="text-xs md:text-sm font-bold text-[#0F3460] uppercase">Real-Time Rankings</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-[#1F2937] mb-2 md:mb-4">Top by Social Platform</h2>
              <p className="text-sm md:text-base text-[#1F2937]/70 max-w-2xl mx-auto">Discover trending submissions from Instagram, LinkedIn, and X. See what your community loves right now.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {['instagram', 'linkedin', 'twitter'].map((platform) => {
                const platformLabel = platform === 'twitter' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1);
                const platformEmoji = platform === 'instagram' ? '📸' : platform === 'linkedin' ? '💼' : '✕';
                const platformColor = platform === 'instagram' ? '#E4405F' : platform === 'linkedin' ? '#0A66C2' : '#000000';
                const bgGradient = platform === 'instagram' ? 'from-pink-50 to-orange-50' : platform === 'linkedin' ? 'from-blue-50 to-cyan-50' : 'from-gray-50 to-slate-50';

                const platformListings = listings
                  .filter(l => platform === 'twitter' ? ['twitter', 'x'].includes(l.platform) : l.platform === platform)
                  .sort((a, b) => (activeTimeFilter === 'today' ? b.dayVotes - a.dayVotes : b.totalVotes - a.totalVotes))
                  .slice(0, 5);

                return (
                  <div
                    key={platform}
                    className={`bg-gradient-to-br ${bgGradient} border-2 md:border-4 border-gray-200 p-4 md:p-6 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 group rounded-2xl backdrop-blur-sm relative overflow-hidden`}
                  >
                    {/* Platform badge */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-2xl bg-white shadow-md border-2 border-gray-200 group-hover:scale-110 transition-transform">
                      {platformEmoji}
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 md:mb-6 pr-16">
                      <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-lg flex items-center justify-center" style={{backgroundColor: platformColor + '15', color: platformColor}}>
                        <PlatformIcon platform={platform} size={20} />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-black text-[#1F2937] uppercase">{platformLabel}</h3>
                        <p className="text-xs text-[#1F2937]/60">Top Rated This {activeTimeFilter === 'today' ? 'Day' : 'Week'}</p>
                      </div>
                    </div>

                    {platformListings.length > 0 ? (
                      <div className="space-y-2 md:space-y-3">
                        {platformListings.map((item, idx) => {
                          const isTopThree = idx < 3;
                          const voteCount = activeTimeFilter === 'today' ? item.dayVotes : item.totalVotes;

                          return (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-between p-2.5 md:p-3.5 rounded-xl transition-all duration-200 group/item cursor-pointer ${
                                isTopThree
                                  ? 'bg-white border-2 border-[#0F3460]/20 shadow-sm hover:shadow-md hover:border-[#0F3460]/40'
                                  : 'bg-white/70 border border-gray-300/50 hover:bg-white hover:border-[#0F3460]/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-black flex-shrink-0 ${
                                  isTopThree
                                    ? 'bg-gradient-to-br from-[#0F3460] to-[#0D2A50] text-white shadow-md'
                                    : 'bg-gray-200 text-[#1F2937]'
                                }`}>
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-bold text-[#1F2937] truncate group-hover/item:text-[#0F3460]">{item.title}</p>
                                  {item.category && (
                                    <p className="text-xs text-[#1F2937]/50 mt-0.5">
                                      {getCategoryLabel(item.category)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                                <span className={`text-xs md:text-sm font-black px-2 py-1 rounded-lg ${
                                  isTopThree
                                    ? 'bg-[#0F3460]/10 text-[#0F3460]'
                                    : 'bg-gray-100 text-[#1F2937]'
                                }`}>
                                  {voteCount}
                                </span>
                                <Icons.Heart />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 md:py-8">
                        <p className="text-3xl mb-2">📭</p>
                        <p className="text-xs md:text-sm text-[#1F2937]/60 font-semibold mb-3">No {platformLabel} submissions yet</p>
                        <p className="text-xs text-[#1F2937]/50">Be the first to submit!</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full mt-4 md:mt-6 px-3 py-2.5 md:py-3 font-bold text-xs md:text-sm rounded-xl transition-all duration-200 active:scale-95 border-2 border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white shadow-sm hover:shadow-md`}
                    >
                      Submit for {platformLabel} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PREMIUM FEATURES SECTION */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-10 md:py-20 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-16">
              <div className="inline-block mb-2 md:mb-4">
                <span className="text-3xl md:text-5xl">💎</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-[#1F2937] mb-2 md:mb-4">Premium Features</h2>
              <p className="text-sm md:text-lg text-[#1F2937]/70 max-w-2xl mx-auto">Boost your product visibility with guaranteed placement and founder spotlight</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
                  className="shadow-sm border border-gray-200 p-4 md:p-8 hover:shadow-xl hover:bg-blue-50 hover:border-[#0F3460]/30 transition-all duration-300 rounded-lg bg-white flex flex-col justify-between relative"
                >
                  <div>
                    <div className="mb-3 md:mb-4">
                      <div className={`text-3xl md:text-4xl font-black ${idx === 0 ? 'text-[#1F2937]' : 'text-[#1F2937]'}`}>
                        {plan.price}
                      </div>
                    </div>

                    <h3 className={`text-lg md:text-2xl font-black mb-1 md:mb-2 uppercase ${idx === 0 ? 'text-[#1F2937]' : 'text-[#1F2937]'}`}>
                      {plan.title}
                    </h3>
                    <p className={`text-xs md:text-sm mb-4 md:mb-6 font-semibold ${idx === 0 ? 'text-[#1F2937]/80' : 'text-[#1F2937]/70'}`}>
                      {plan.description}
                    </p>

                    <div className="space-y-2 py-3 md:py-6 border-t-3 border-b-3 border-gray-300/20 mb-4 md:mb-6">
                      {plan.features.map((feature, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs font-bold ${idx === 0 ? 'text-[#1F2937]' : 'text-[#1F2937]'}`}>
                          <span className={`${idx === 0 ? 'text-[#1F2937]' : 'text-[#0F3460]'}`}>✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedListingForPremium(listings[0] || null);
                      setPremiumModalOpen(true);
                    }}
                    className={`w-full py-2 md:py-4 font-bold text-xs md:text-sm rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 border ${
                      idx === 0
                        ? 'bg-[#0F3460] text-white border-[#0F3460] hover:bg-[#0D2A50]'
                        : 'bg-[#0F3460] text-white border-[#0F3460] hover:bg-[#0D2A50]'
                    }`}
                  >
                    Get {plan.title}
                  </button>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* TESTIMONIALS CAROUSEL SECTION */}
        <section className="py-10 md:py-20 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-4xl font-black text-[#1F2937] mb-2 md:mb-4 text-center">Trusted by Builders Worldwide</h2>
            <p className="text-center text-sm md:text-base text-[#1F2937]/70 mb-8 md:mb-12 max-w-2xl mx-auto">Founders, indie hackers, and agencies ship on RankBid every day. Here is what they are saying, straight from X.</p>

            <TestimonialsCarousel testimonials={[
              {
                name: 'Sarah Chen',
                handle: '@sarahchen',
                text: 'Submitted our SaaS tool on RankBid and got 1,200 votes in the first week! The community voting is so transparent and fair. No algorithms hiding our product from users.'
              },
              {
                name: 'Alex Rodriguez',
                handle: '@alexroddev',
                text: 'Love how simple it is to submit and share. RankBid got my indie project discovered by thousands of users organically. The real-time rankings are addictive!'
              },
              {
                name: 'Emma Thompson',
                handle: '@emmathompson',
                text: 'Our AI tool ranked #1 in Developer category. The community-driven approach means quality products actually rise to the top. This is how discovery should work.'
              },
              {
                name: 'James Wilson',
                handle: '@jameswilson',
                text: 'Completely free to submit and compete on rankings. No gatekeepers, no algorithm black box. Just pure community voting power determining what gets seen.'
              },
              {
                name: 'Lisa Park',
                handle: '@lisapark_',
                text: 'The category filters and real-time updates make it perfect for finding what\'s trending. RankBid transformed how we discover new tools in our niche.'
              },
              {
                name: 'David Kumar',
                handle: '@davidkumar',
                text: 'Submitted 3 products and they all got amazing visibility. The community on RankBid actually votes on what they love. Finally a fair ranking platform!'
              }
            ]} />
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-10 md:py-20 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-black text-[#1F2937] mb-2 md:mb-4 text-center">Frequently Asked Questions</h2>
            <p className="text-xs md:text-sm font-medium text-[#1F2937]/70 mb-8 md:mb-12 text-center max-w-2xl mx-auto">Vote counts and community rankings are built into every submission, so discovery and engagement never leave the platform.</p>

            <div className="space-y-3">
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

        {/* CTA Section - After FAQ */}
        <section className="py-10 md:py-20 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 md:px-6">
            <div className="p-8 md:p-16 bg-gradient-to-r from-[#0F3460] to-[#1a5490] rounded-2xl text-white text-center shadow-lg border-2 border-[#0F3460]/30">
              <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3">Get Your Product Ranked</h3>
              <p className="text-sm md:text-base mb-4 md:mb-6 opacity-95 max-w-xl mx-auto">Submit across all platforms and climb the global rankings. No algorithms. Just community voting power.</p>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3.5 bg-white text-[#0F3460] font-black text-xs md:text-sm rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
                >
                  <Icons.Upload />
                  START RANKING NOW
                </button>
                <a
                  href="/platforms"
                  className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3.5 bg-white/20 text-white font-black text-xs md:text-sm rounded-xl hover:bg-white/30 active:scale-95 transition-all duration-200 shadow-lg border-2 border-white/40"
                >
                  <Icons.TrendingUp />
                  EXPLORE PLATFORMS
                </a>
              </div>
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

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="Login Required to Submit"
      />

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-auto z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-3 md:px-4 py-2 md:py-3 border-2 md:border-3 border-gray-300 font-bold text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 ${
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
