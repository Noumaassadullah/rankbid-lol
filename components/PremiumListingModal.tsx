'use client';

import { useEffect, useState } from 'react';

interface PremiumListingModalProps {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PremiumData) => Promise<void>;
}

interface PremiumData {
  position: number;
  bidUsd: number;
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

// Link types a founder can pick for each social link row (all saved by the premium API).
const SOCIALS = [
  { name: 'founderWebsite', label: 'Website', placeholder: 'https://example.com', icon: '/web.png' },
  { name: 'founderTwitter', label: 'X / Twitter', placeholder: 'x.com/handle', icon: '/twitter.png' },
  { name: 'founderLinkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/…', icon: '/linkedin.png' },
  { name: 'founderInstagram', label: 'Instagram', placeholder: 'instagram.com/handle', icon: '/instagram.png' },
  { name: 'founderFacebook', label: 'Facebook', placeholder: 'facebook.com/…', icon: '/facebook.png' },
  { name: 'founderTiktok', label: 'TikTok', placeholder: 'tiktok.com/@handle', icon: '/tiktok.png' },
  { name: 'founderYoutube', label: 'YouTube', placeholder: 'youtube.com/@…', icon: '' },
  { name: 'founderGithub', label: 'GitHub', placeholder: 'github.com/…', icon: '' },
] as const;

type SocialField = (typeof SOCIALS)[number]['name'];

// YouTube and GitHub have no image in /public, so they get inline marks.
function SocialMark({ field }: { field: SocialField }) {
  const social = SOCIALS.find(s => s.name === field)!;
  if (social.icon) return <img src={social.icon} alt="" className="w-4 h-4 object-contain" />;
  if (field === 'founderYoutube') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <rect x="1.5" y="5" width="21" height="14" rx="4" fill="#FF0000" />
        <path d="M10 9v6l5.2-3z" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#181717" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

// Starting prices; the live minimum for a held spot comes from /api/premium-listings/ladder.
const PRICES: { [key: number]: number } = {
  1: 5,
  2: 3,
  3: 1,
};

interface LadderSpot {
  position: number;
  held: boolean;
  heldByListingId: string | null;
  currentBidUsd: number | null;
  minBidUsd: number;
  minBidPkr: number;
}

export default function PremiumListingModal({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onSubmit,
}: PremiumListingModalProps) {
  const [position, setPosition] = useState(1);
  const [ladder, setLadder] = useState<LadderSpot[] | null>(null);
  // What the buyer typed; empty means "the current minimum".
  const [bidInput, setBidInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'rapid-gateway' | 'jazzcash' | 'easypaisa' | 'manual'>('rapid-gateway');
  // Which link type each social row holds, in order. Values live in formData.
  const [linkRows, setLinkRows] = useState<SocialField[]>(['founderWebsite']);
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

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch('/api/premium-listings/ladder', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (!cancelled && data?.spots) setLadder(data.spots); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen]);

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

    // Only send the social links that are shown for the chosen spot.
    const shown = new Set<string>(visibleRows);
    const payload = { ...formData };
    for (const s of SOCIALS) {
      if (!shown.has(s.name)) payload[s.name] = '';
    }

    try {
      console.log('🎯 Submitting premium listing:', {
        position,
        name: formData.founderName,
        email: formData.founderEmail,
        phone: formData.founderPhone,
      });

      if (bid < minBid) {
        setError(`❌ #${position} needs at least $${minBid}`);
        setLoading(false);
        return;
      }

      await onSubmit({
        position,
        bidUsd: bid,
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
        setBidInput('');
        setPaymentMethod('rapid-gateway');
        setLinkRows(['founderWebsite']);
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

  const spotOf = (pos: number) => ladder?.find(s => s.position === pos);
  const minBidOf = (pos: number) => spotOf(pos)?.minBidUsd ?? PRICES[pos];
  const minBid = minBidOf(position);
  const ownSpot = spotOf(position)?.heldByListingId === listingId;
  const bid = bidInput === '' ? minBid : Math.round(Number(bidInput) * 100) / 100;
  const price = Number.isFinite(bid) ? bid : minBid;

  const PERKS: Record<number, string> = { 1: 'Top spot · 4 social links', 2: 'Featured · 1 social link', 3: 'Featured listing' };
  // #1 allows 4 social links, #2 allows 1, #3 none. Each row picks its own platform.
  const linkLimit = position === 1 ? 4 : position === 2 ? 1 : 0;
  const visibleRows = linkRows.slice(0, linkLimit);
  const unusedSocials = SOCIALS.filter(s => !linkRows.includes(s.name));

  const changeRowPlatform = (index: number, next: SocialField) => {
    const prevField = linkRows[index];
    setLinkRows(rows => rows.map((r, i) => (i === index ? next : r)));
    // Carry the typed link over to the newly picked platform.
    setFormData(prev => ({ ...prev, [next]: prev[prevField], [prevField]: '' }));
  };
  const removeRow = (index: number) => {
    const field = linkRows[index];
    setLinkRows(rows => rows.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, [field]: '' }));
  };
  const addRow = () => {
    if (unusedSocials[0]) setLinkRows(rows => [...rows, unusedSocials[0].name]);
  };
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
                    onClick={() => { setPosition(pos); setBidInput(''); }}
                    aria-pressed={active}
                    className={`relative rounded-xl border p-2.5 text-left transition-all active:scale-[0.98] ${
                      active ? 'border-[#0F3460] bg-[#0F3460] text-white shadow-md' : 'border-gray-200 bg-white hover:border-[#0F3460]/40'
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black">#{pos}</span>
                      <span className={`text-sm font-black ${active ? 'text-amber-300' : 'text-[#0F3460]'}`}>${minBidOf(pos)}</span>
                    </div>
                    <p className={`text-[10px] sm:text-[11px] leading-snug mt-1 ${active ? 'text-white/75' : 'text-[#1F2937]/55'}`}>{PERKS[pos]}</p>
                    {spotOf(pos)?.held && (
                      <p className={`text-[10px] font-bold mt-1 ${active ? 'text-amber-300' : 'text-amber-600'}`}>Taken · outbid it</p>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#1F2937]/55 mt-2">
              {spotOf(position)?.held
                ? `#${position} is held at $${spotOf(position)!.currentBidUsd}. Pay $${minBid} or more to take it; the current holder moves down one spot.`
                : `#${position} is free. Featured there for 30 days unless someone pays more.`}
            </p>
            {ownSpot && <p className="text-[11px] font-bold text-amber-700 mt-1">This product already holds #{position}.</p>}

            <label className="mt-3 flex items-center gap-2">
              <span className={fieldLabel + ' mb-0 whitespace-nowrap'}>Your bid (USD)</span>
              <span className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#1F2937]/50">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={minBid}
                  step="1"
                  value={bidInput}
                  onChange={e => setBidInput(e.target.value)}
                  placeholder={String(minBid)}
                  className={input + ' pl-6'}
                />
              </span>
            </label>
            <p className="text-[11px] text-[#1F2937]/55 mt-1">
              Minimum ${minBid}. Bidding higher makes it harder for the next person to push you down.
            </p>
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
              <div className="flex items-baseline justify-between mb-2.5">
                <p className="text-xs font-black text-[#1F2937]">
                  Social links <span className="font-semibold text-[#1F2937]/45">· shown on your listing</span>
                </p>
                <span className="text-[11px] font-bold text-[#1F2937]/45 tabular-nums">{visibleRows.length} / {linkLimit}</span>
              </div>

              <div className="space-y-2">
                {visibleRows.map((field, index) => {
                  const social = SOCIALS.find(s => s.name === field)!;
                  return (
                    <div
                      key={field}
                      className="flex items-stretch rounded-lg border border-gray-300 bg-white focus-within:border-[#0F3460] focus-within:ring-2 focus-within:ring-[#0F3460]/25 transition"
                    >
                      {/* Platform picker */}
                      <label className="relative flex items-center gap-2 pl-3 pr-7 border-r border-gray-200 bg-gray-50 rounded-l-lg cursor-pointer flex-shrink-0">
                        <SocialMark field={field} />
                        <span className="text-xs font-bold text-[#1F2937] whitespace-nowrap">{social.label}</span>
                        <svg className="absolute right-2 w-3.5 h-3.5 text-[#1F2937]/45 pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
                        </svg>
                        <select
                          aria-label={`Platform for link ${index + 1}`}
                          value={field}
                          onChange={e => changeRowPlatform(index, e.target.value as SocialField)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                          {SOCIALS.filter(s => s.name === field || !linkRows.includes(s.name)).map(s => (
                            <option key={s.name} value={s.name}>{s.label}</option>
                          ))}
                        </select>
                      </label>

                      <input
                        type="text"
                        name={field}
                        aria-label={`${social.label} link`}
                        value={formData[field]}
                        onChange={handleChange}
                        placeholder={social.placeholder}
                        className="min-w-0 flex-1 px-3 py-2 text-sm text-[#1F2937] bg-transparent placeholder-gray-400 focus:outline-none"
                      />

                      {visibleRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          aria-label={`Remove ${social.label} link`}
                          className="px-2.5 text-[#1F2937]/35 hover:text-red-600 transition"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {visibleRows.length < linkLimit && unusedSocials.length > 0 && (
                <button
                  type="button"
                  onClick={addRow}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-bold text-[#0F3460] hover:border-[#0F3460] hover:bg-[#0F3460]/[0.03] transition"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Add link
                </button>
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
            disabled={loading || ownSpot || price < minBid}
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
