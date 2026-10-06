'use client';

import { useState, useEffect } from 'react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(1182);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/waitlist/count');
        if (res.ok) {
          const data = await res.json();
          setWaitlistCount(data.count || 1182);
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setEmail('');

        // Fetch updated count from database
        fetch('/api/waitlist/count')
          .then(r => r.json())
          .then(d => {
            setWaitlistCount(d.count || 1182);
          })
          .catch(() => {
            // If fetch fails, increment optimistically
            setWaitlistCount(prev => prev + 1);
          });

        setTimeout(() => setSubmitted(false), 5000);
      } else {
        alert(data.error || 'Failed to join waitlist');
        setEmail('');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl text-center">
        {/* Logo */}
        <h1 className="text-6xl md:text-7xl font-black text-[#1F2937] mb-12 tracking-tight">
          rankbid
        </h1>

        {/* Teaser Message */}
        <p className="text-base md:text-lg text-[#1F2937]/60 mb-12 font-medium leading-relaxed">
          We're cooking something awesome here...
        </p>

        {/* Form Section */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full sm:w-96 px-6 py-4 bg-white border-2 border-gray-300 rounded-full text-[#1F2937] placeholder-[#1F2937]/40 text-sm md:text-base focus:outline-none focus:border-[#0F3460] transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 bg-[#1F2937] text-white font-black text-sm md:text-base rounded-full hover:bg-[#0F3460] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loading ? 'Joining...' : 'Join waitlist'} {!loading && '→'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 animate-in fade-in">
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl inline-block">
              <p className="text-lg font-black text-green-700">✓ Got it!</p>
              <p className="text-sm text-green-600 mt-2">We'll notify you when we launch.</p>
            </div>
          </div>
        )}

        {/* Social Proof */}
        <p className="text-sm md:text-base text-[#1F2937]/60 font-medium">
          First come, first serve. There are{' '}
          <span className="font-black text-[#1F2937]">{waitlistCount}</span>{' '}
          {waitlistCount === 1 ? 'person' : 'people'} on the waitlist already.
        </p>
      </div>
    </div>
  );
}
