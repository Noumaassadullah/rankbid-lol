'use client';

import { useState, useEffect } from 'react';

const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse-gentle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes floatBlob1 {
    0%, 100% {
      transform: translate(0px, 0px) scale(1);
      opacity: 0.4;
    }
    25% {
      transform: translate(30px, -50px) scale(1.1);
      opacity: 0.5;
    }
    50% {
      transform: translate(60px, 0px) scale(0.9);
      opacity: 0.3;
    }
    75% {
      transform: translate(30px, 50px) scale(1.05);
      opacity: 0.45;
    }
  }

  @keyframes floatBlob2 {
    0%, 100% {
      transform: translate(0px, 0px) scale(1);
      opacity: 0.3;
    }
    25% {
      transform: translate(-40px, 60px) scale(0.95);
      opacity: 0.4;
    }
    50% {
      transform: translate(-80px, 30px) scale(1.1);
      opacity: 0.35;
    }
    75% {
      transform: translate(-40px, -50px) scale(1.02);
      opacity: 0.38;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-gentle {
    animation: pulse-gentle 2s ease-in-out infinite;
  }

  .animate-blob-1 {
    animation: floatBlob1 8s ease-in-out infinite;
  }

  .animate-blob-2 {
    animation: floatBlob2 10s ease-in-out infinite;
  }

  .delay-1 {
    animation-delay: 0.1s;
  }

  .delay-2 {
    animation-delay: 0.3s;
  }

  .delay-3 {
    animation-delay: 0.5s;
  }

  .delay-4 {
    animation-delay: 0.7s;
  }

  .input-focus-glow:focus {
    box-shadow: 0 0 0 3px rgba(15, 52, 96, 0.1);
  }
`;

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
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-white via-white to-gray-50 flex flex-col items-center justify-center px-4 py-20 overflow-hidden relative" suppressHydrationWarning>
        {/* Animated Background Blobs */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full blur-3xl opacity-20 -z-10 animate-blob-1"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full blur-3xl opacity-15 -z-10 animate-blob-2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-10 -z-10 animate-blob-1" style={{animationDelay: '-4s'}}></div>

        <div className="w-full max-w-2xl text-center relative z-10">
          {/* Logo */}
          <div className="animate-fade-in-up delay-1">
            <h1 className="text-6xl md:text-7xl font-black text-[#1F2937] mb-12 tracking-tight animate-float">
              rankbid
            </h1>
          </div>

          {/* Teaser Message */}
          <div className="animate-fade-in-up delay-2">
            <p className="text-base md:text-lg text-[#1F2937]/60 mb-12 font-medium leading-relaxed">
              We're cooking something awesome here...
            </p>
          </div>

          {/* Form Section */}
          <div className="animate-fade-in-up delay-3">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full sm:w-96 px-6 py-4 bg-white border-2 border-gray-300 rounded-full text-[#1F2937] placeholder-[#1F2937]/40 text-sm md:text-base focus:outline-none focus:border-[#0F3460] transition-all duration-300 input-focus-glow"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-4 bg-[#1F2937] text-white font-black text-sm md:text-base rounded-full hover:bg-[#0F3460] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Joining...' : 'Join waitlist'} {!loading && '→'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 animate-fade-in-up">
                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl inline-block shadow-md">
                  <p className="text-lg font-black text-green-700">✓ Got it!</p>
                  <p className="text-sm text-green-600 mt-2">We'll notify you when we launch.</p>
                </div>
              </div>
            )}
          </div>

          {/* Social Proof */}
          <div className="animate-fade-in-up delay-4">
            <p className="text-sm md:text-base text-[#1F2937]/60 font-medium">
              First come, first serve. There are{' '}
              <span className="font-black text-[#1F2937] inline-block animate-pulse-gentle">
                {waitlistCount}
              </span>{' '}
              {waitlistCount === 1 ? 'person' : 'people'} on the waitlist already.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
