'use client';

import { useState } from 'react';

interface PremiumListingModalProps {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PremiumData) => Promise<void>;
}

interface PremiumData {
  position: number;
  founderName: string;
  founderEmail: string;
  founderPhone: string;
  founderWebsite?: string;
  founderTwitter?: string;
  founderLinkedin?: string;
  founderInstagram?: string;
  founderFacebook?: string;
  founderTiktok?: string;
  founderYoutube?: string;
  founderGithub?: string;
  paymentMethod: string;
}

// Extra link types offered behind "Add other" (all saved by the premium API).
const OTHER_SOCIALS = [
  { name: 'founderFacebook', label: 'Facebook', placeholder: 'facebook.com/…' },
  { name: 'founderTiktok', label: 'TikTok', placeholder: '@handle' },
  { name: 'founderYoutube', label: 'YouTube', placeholder: 'youtube.com/@…' },
  { name: 'founderGithub', label: 'GitHub', placeholder: 'github.com/…' },
];

const PRICES: { [key: number]: number } = {
  1: 5,
  2: 3,
  3: 1,
};

export default function PremiumListingModal({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onSubmit,
}: PremiumListingModalProps) {
  const [position, setPosition] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'rapid-gateway' | 'jazzcash' | 'easypaisa' | 'manual'>('rapid-gateway');
  const [extraSocials, setExtraSocials] = useState<string[]>([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    founderName: '',
    founderEmail: '',
    founderPhone: '',
    founderWebsite: '',
    founderTwitter: '',
    founderLinkedin: '',
    founderInstagram: '',
    founderFacebook: '',
    founderTiktok: '',
    founderYoutube: '',
    founderGithub: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Validate required fields
    if (!formData.founderName.trim()) {
      setError('❌ Please enter founder name');
      setLoading(false);
      return;
    }
    if (!formData.founderEmail.trim()) {
      setError('❌ Please enter founder email');
      setLoading(false);
      return;
    }
    if (!formData.founderPhone.trim()) {
      setError('❌ Please enter founder phone');
      setLoading(false);
      return;
    }
    if (filledLinks > linkLimit) {
      setError(`❌ The #${position} spot shows up to ${linkLimit} social link${linkLimit === 1 ? '' : 's'}. Clear ${filledLinks - linkLimit} to continue.`);
      setLoading(false);
      return;
    }

    // Only send the social links that are shown for the chosen spot.
    const shown = new Set(visibleSocials.map(s => s.name));
    const payload = { ...formData };
    for (const s of [...SOCIALS, ...OTHER_SOCIALS]) {
      if (!shown.has(s.name)) payload[s.name as keyof typeof payload] = '';
    }

    try {
      console.log('🎯 Submitting premium listing:', {
        position,
        name: formData.founderName,
        email: formData.founderEmail,
        phone: formData.founderPhone,
      });

      await onSubmit({
        position,
        ...payload,
        paymentMethod,
      });

      console.log('✅ Premium listing submitted successfully');
      setSuccessMessage('✅ Premium request submitted successfully! Awaiting admin approval.');

      // Reset form after brief delay
      setTimeout(() => {
        setFormData({
          founderName: '',
          founderEmail: '',
          founderPhone: '',
          founderWebsite: '',
          founderTwitter: '',
          founderLinkedin: '',
          founderInstagram: '',
          founderFacebook: '',
          founderTiktok: '',
          founderYoutube: '',
          founderGithub: '',
        });
        setPosition(1);
        setPaymentMethod('rapid-gateway');
        setExtraSocials([]);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('❌ Premium submission error:', err);
      const errorMessage = err.message || 'Failed to submit premium listing request';
      setError(`❌ Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const price = PRICES[position] || 5;

  const PERKS: Record<number, string> = { 1: 'Top spot · 4 social links', 2: 'Featured · 1 social link', 3: 'Featured listing' };
  const SOCIALS = [
    { name: 'founderWebsite', label: 'Website', placeholder: 'https://example.com' },
    { name: 'founderTwitter', label: 'X / Twitter', placeholder: '@handle' },
    { name: 'founderLinkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/…' },
    { name: 'founderInstagram', label: 'Instagram', placeholder: '@handle' },
  ];
  // #1 shows 4 social fields, #2 shows 1, #3 shows none. "Add other" can add any of OTHER_SOCIALS,
  // but the number of filled links still can't go over the spot's limit.
  const linkLimit = position === 1 ? 4 : position === 2 ? 1 : 0;
  const visibleSocials = [...SOCIALS.slice(0, linkLimit), ...OTHER_SOCIALS.filter(s => extraSocials.includes(s.name))];
  const filledLinks = visibleSocials.filter(s => formData[s.name as keyof typeof formData].trim()).length;
  const addableSocials = OTHER_SOCIALS.filter(s => !extraSocials.includes(s.name));
  const METHODS = [
    { id: 'rapid-gateway', label: 'Card', desc: 'Rapid Gateway' },
    { id: 'jazzcash', label: 'JazzCash', desc: 'Mobile wallet' },
    { id: 'easypaisa', label: 'EasyPaisa', desc: 'Mobile wallet' },
    { id: 'manual', label: 'Manual', desc: 'Admin verifies' },
  ] as const;
  const methodName = paymentMethod === 'rapid-gateway' ? 'Card' : paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : '';

  const input = 'w-full px-3 py-2 text-sm bg-white text-[#1F2937] border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F3460]/25 focus:border-[#0F3460] transition';
  const fieldLabel = 'block text-xs font-bold text-[#1F2937]/70 mb-1';
  const sectionTitle = 'text-xs font-black text-[#1F2937] mb-2.5';

  return (
    <div className="fixed inset-0 bg-[#0B2545]/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden slide-up"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#0F3460] to-[#1a5490] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="absolute -top-16 -right-10 w-40 h-40 bg-[#059669]/30 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="relative min-w-0 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-[#0B2545] flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z" /></svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black leading-tight">Boost to Premium</h2>
              <p className="text-xs text-white/65 truncate">{listingTitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-4 sm:px-5 py-4 space-y-5">
          {successMessage && <div className="bg-[#059669]/10 border border-[#059669]/30 text-[#047857] px-3 py-2.5 rounded-lg text-sm font-semibold">{successMessage}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm font-semibold">{error}</div>}

          {/* Position */}
          <div>
            <p className={sectionTitle}>Choose your spot</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(pos => {
                const active = position === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    aria-pressed={active}
                    className={`relative rounded-xl border p-2.5 text-left transition-all active:scale-[0.98] ${
                      active ? 'border-[#0F3460] bg-[#0F3460] text-white shadow-md' : 'border-gray-200 bg-white hover:border-[#0F3460]/40'
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black">#{pos}</span>
                      <span className={`text-sm font-black ${active ? 'text-amber-300' : 'text-[#0F3460]'}`}>${PRICES[pos]}</span>
                    </div>
                    <p className={`text-[10px] sm:text-[11px] leading-snug mt-1 ${active ? 'text-white/75' : 'text-[#1F2937]/55'}`}>{PERKS[pos]}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#1F2937]/55 mt-2">Featured at #{position} for 30 days. Votes can still move it up.</p>
          </div>

          {/* Founder */}
          <div>
            <p className={sectionTitle}>Founder details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="block">
                <span className={fieldLabel}>Name *</span>
                <input type="text" name="founderName" value={formData.founderName} onChange={handleChange} required className={input} placeholder="Your name" />
              </label>
              <label className="block">
                <span className={fieldLabel}>Email *</span>
                <input type="email" name="founderEmail" value={formData.founderEmail} onChange={handleChange} required className={input} placeholder="you@example.com" />
              </label>
              <label className="block sm:col-span-2">
                <span className={fieldLabel}>Phone *</span>
                <input type="tel" name="founderPhone" value={formData.founderPhone} onChange={handleChange} required className={input} placeholder="+92 300 1234567" />
              </label>
            </div>
          </div>

          {/* Socials */}
          {linkLimit > 0 && (
            <div>
              <p className={sectionTitle}>
                Social links{' '}
                <span className={`font-semibold ${filledLinks > linkLimit ? 'text-red-600' : 'text-[#1F2937]/45'}`}>
                  · {filledLinks} of {linkLimit} used, shown on your listing
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visibleSocials.map(field => {
                  const isExtra = extraSocials.includes(field.name);
                  return (
                    <label key={field.name} className="block">
                      <span className={`${fieldLabel} flex items-center justify-between`}>
                        {field.label}
                        {isExtra && (
                          <button
                            type="button"
                            onClick={() => {
                              setExtraSocials(prev => prev.filter(n => n !== field.name));
                              setFormData(prev => ({ ...prev, [field.name]: '' }));
                            }}
                            className="text-[11px] font-semibold text-[#1F2937]/45 hover:text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </span>
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className={input}
                      />
                    </label>
                  );
                })}
              </div>

              {addableSocials.length > 0 && (
                <div className="mt-2.5">
                  {addMenuOpen ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {addableSocials.map(s => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => {
                            setExtraSocials(prev => [...prev, s.name]);
                            setAddMenuOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-[#0F3460] hover:border-[#0F3460] hover:bg-[#0F3460]/5 transition"
                        >
                          + {s.label}
                        </button>
                      ))}
                      <button type="button" onClick={() => setAddMenuOpen(false)} className="px-2 py-1.5 text-xs font-semibold text-[#1F2937]/45 hover:text-[#1F2937]">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddMenuOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F3460] hover:underline underline-offset-2"
                    >
                      <span className="w-5 h-5 rounded-full border border-[#0F3460]/30 flex items-center justify-center leading-none">+</span>
                      Add other (Facebook, TikTok, YouTube, GitHub)
                    </button>
                  )}
                </div>
              )}
              {filledLinks > linkLimit && (
                <p className="text-[11px] text-red-600 mt-2">Only {linkLimit} link{linkLimit === 1 ? '' : 's'} can be shown for #{position}. Clear {filledLinks - linkLimit} to continue.</p>
              )}
            </div>
          )}

          {/* Payment */}
          <div>
            <p className={sectionTitle}>Payment method</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {METHODS.map(method => {
                const active = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    aria-pressed={active}
                    className={`rounded-lg border px-2.5 py-2 text-left transition-all ${
                      active ? 'border-[#0F3460] bg-[#0F3460]/5 ring-1 ring-[#0F3460]' : 'border-gray-200 hover:border-[#0F3460]/40'
                    }`}
                  >
                    <p className="text-xs font-black text-[#1F2937]">{method.label}</p>
                    <p className="text-[10px] text-[#1F2937]/50">{method.desc}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#1F2937]/55 mt-2">
              {paymentMethod === 'manual'
                ? 'After you submit, an admin verifies your payment and activates the listing.'
                : `You’ll be redirected to ${paymentMethod === 'rapid-gateway' ? 'Rapid Gateway' : methodName} to pay securely.`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#1F2937]/50 leading-none">Total</p>
            <p className="text-xl font-black text-[#0F3460] leading-tight">${price}</p>
          </div>
          <button type="button" onClick={onClose} className="ml-auto px-3 py-2 text-sm font-bold text-[#1F2937]/60 hover:text-[#1F2937] transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#0F3460] to-[#1a5490] text-white text-sm font-black rounded-xl shadow-lg shadow-[#0F3460]/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all whitespace-nowrap"
          >
            {loading
              ? 'Processing…'
              : paymentMethod === 'manual'
                ? `Submit $${price} request`
                : `Pay $${price}${methodName ? ` with ${methodName}` : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
}
