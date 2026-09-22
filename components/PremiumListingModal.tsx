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
    paymentMethod: 'manual',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        position,
        ...formData,
        paymentMethod: 'manual',
      });
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
        paymentMethod: 'manual',
      });
      setPosition(1);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit premium listing request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const price = PRICES[position] || 5;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-[#0F3460] border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#1F2937] uppercase">Boost to Premium</h2>
            <p className="text-sm text-[#1F2937]/70 font-semibold mt-1">{listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-black text-[#1F2937] hover:scale-110 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold text-sm">
              {error}
            </div>
          )}

          {/* Position Selection */}
          <div>
            <label className="block text-sm font-black text-[#1F2937] mb-3 uppercase">
              Select Position & Price
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`p-4 border-3 transition-all duration-200 hover:scale-105 ${
                    position === pos
                      ? 'bg-[#0F3460] border-[#0F3460] text-[#1F2937]'
                      : 'bg-white border-gray-300 text-[#1F2937] hover:bg-blue-100'
                  }`}
                >
                  <p className="text-2xl font-black">#{pos}</p>
                  <p className="text-lg font-black text-[#0F3460] mt-1">${PRICES[pos]}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#1F2937]/60 font-semibold mt-2">
              📌 Your product will be featured at position #{position} for ${price}. Votes can still move it in rankings.
            </p>
          </div>

          {/* Founder Information */}
          <div className="border-t-4 border-gray-300 pt-6">
            <h3 className="text-lg font-black text-[#1F2937] mb-4 uppercase">Founder Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-[#1F2937] mb-2">Name *</label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-[#1F2937] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1F2937] mb-2">Email *</label>
                <input
                  type="email"
                  name="founderEmail"
                  value={formData.founderEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-[#1F2937] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1F2937] mb-2">Phone *</label>
                <input
                  type="tel"
                  name="founderPhone"
                  value={formData.founderPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-[#1F2937] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
          </div>

          {/* Social Accounts */}
          {position !== 3 && (
            <div className="border-t-4 border-gray-300 pt-6">
              <h3 className="text-lg font-black text-[#1F2937] mb-4 uppercase">Social Accounts</h3>
              <p className="text-xs text-[#1F2937]/60 font-semibold mb-4">
                {position === 1 ? 'Add up to 4 social profiles to be displayed on your premium listing' : 'Add 1 social profile to be displayed on your premium listing'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'founderWebsite', label: 'Website', placeholder: 'https://example.com' },
                  { name: 'founderTwitter', label: 'Twitter/X', placeholder: '@handle' },
                  { name: 'founderLinkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                  { name: 'founderInstagram', label: 'Instagram', placeholder: '@handle' },
                  { name: 'founderFacebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                  { name: 'founderTiktok', label: 'TikTok', placeholder: '@handle' },
                  { name: 'founderYoutube', label: 'YouTube', placeholder: 'https://youtube.com/c/...' },
                  { name: 'founderGithub', label: 'GitHub', placeholder: '@username' },
                ].map((field, idx) => {
                  // Plan #1: Show first 4 socials
                  // Plan #2: Show only first 1 social
                  if (position === 1 && idx >= 4) return null;
                  if (position === 2 && idx >= 1) return null;

                  return (
                    <div key={field.name}>
                      <label className="block text-xs font-bold text-[#1F2937] mb-2 uppercase">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-[#1F2937] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-gray-50 border-2 border-gray-300 p-4">
            <p className="font-bold text-[#1F2937] mb-2">Payment Method: Manual Verification</p>
            <p className="text-sm text-[#1F2937]/70">
              After submission, an admin will verify your payment of <span className="font-black">${price}</span> and activate your premium listing. You'll receive a confirmation email.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-white text-[#1F2937] font-black uppercase text-sm border-gray-300 border-3 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-[#0F3460] text-white font-black uppercase text-sm border-[#0F3460] border-3 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Processing...
                </>
              ) : (
                <>
                  💳 Pay ${price} & Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
