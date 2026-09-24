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
  const [successMessage, setSuccessMessage] = useState('');
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

    try {
      console.log('🎯 Submitting premium listing:', {
        position,
        name: formData.founderName,
        email: formData.founderEmail,
        phone: formData.founderPhone,
      });

      await onSubmit({
        position,
        ...formData,
        paymentMethod: 'manual',
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
          paymentMethod: 'manual',
        });
        setPosition(1);
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white shadow-lg border-2 border-gray-300 rounded-lg max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-orange-600 border-b-4 border-gray-300 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">💎 Boost to Premium</h2>
            <p className="text-sm text-white/80 font-semibold mt-1">{listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-3xl font-black text-white hover:scale-110 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {successMessage && (
            <div className="bg-green-100 border-2 border-green-500 text-green-700 p-4 font-bold text-sm">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold text-sm">
              {error}
            </div>
          )}

          {/* Position Selection */}
          <div>
            <label className="block text-sm font-black text-[#1F2937] mb-4 uppercase">
              Select Position & Price
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`py-4 px-4 rounded-lg transition-all duration-200 border-2 font-black ${
                    position === pos
                      ? 'bg-orange-600 border-orange-700 shadow-lg text-white ring-2 ring-orange-400 ring-offset-2'
                      : 'bg-gray-50 border-gray-300 hover:border-orange-400 text-gray-900 hover:bg-orange-50'
                  }`}
                >
                  <p className="text-2xl">#{pos}</p>
                  <p className={`text-lg font-black mt-2 ${
                    position === pos
                      ? 'text-white'
                      : 'text-orange-600'
                  }`}>${PRICES[pos]}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 font-semibold mt-4 bg-blue-50 border border-blue-200 p-3 rounded">
              📌 Your product will be featured at position #{position} for ${price}. Votes can still move it in rankings.
            </p>
          </div>

          {/* Founder Information */}
          <div className="border-t-4 border-gray-300 pt-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase">👤 Founder Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Name *</label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Email *</label>
                <input
                  type="email"
                  name="founderEmail"
                  value={formData.founderEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="john@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase">Phone *</label>
                <input
                  type="tel"
                  name="founderPhone"
                  value={formData.founderPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
          </div>

          {/* Social Accounts */}
          {position !== 3 && (
            <div className="border-t-4 border-gray-300 pt-6">
              <h3 className="text-lg font-black text-gray-900 mb-4 uppercase">🔗 Social Accounts</h3>
              <p className="text-xs text-gray-600 font-semibold mb-4 bg-gray-50 p-3 rounded border border-gray-300">
                {position === 1 ? '✓ Add up to 4 social profiles to be displayed on your premium listing' : '✓ Add 1 social profile to be displayed on your premium listing'}
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
                      <label className="block text-xs font-black text-gray-900 mb-2 uppercase">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded">
            <p className="font-black text-gray-900 mb-2 uppercase">💰 Payment Method: Manual Verification</p>
            <p className="text-sm text-gray-700">
              After submission, an admin will verify your payment of <span className="font-black text-orange-600">${price}</span> and activate your premium listing. You'll receive a confirmation email.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t-4 border-gray-300">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 bg-white text-gray-900 font-bold text-sm border-2 border-gray-400 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-orange-600 text-white font-black text-sm rounded-lg hover:bg-orange-700 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg border-2 border-orange-700 uppercase"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Processing...
                </>
              ) : (
                <>
                  💳 Pay ${price} & Submit Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
