'use client';

import { useState, useRef } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

interface StatusCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    description: string;
    category: string;
    platform: string;
    totalVotes?: number;
    rank: number;
  };
  productUrl: string;
}

export default function StatusCardModal({ isOpen, onClose, product, productUrl }: StatusCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!cardRef.current) {
      alert('Card not found. Please refresh and try again.');
      return;
    }
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1F2937',
        scale: 2,
        useCORS: true,
        logging: false,
        imageTimeout: 15000,
        allowTaint: false,
      });

      if (!canvas) {
        throw new Error('Canvas creation failed');
      }

      // Convert to blob for better browser support
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to create image. Please try again.');
          setDownloading(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rankbid-${product.title.replace(/\s+/g, '-')}-rank-${product.rank}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setDownloading(false);
        }, 100);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to download image:', error);
      alert(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1F2937',
        scale: 2,
      });
      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };

  const handleShareTwitter = () => {
    const text = `🎯 I just ranked #${product.rank} on RankBid!\n\n"${product.title}"\n\n📊 ${product.category}\n💪 ${product.totalVotes || 0} votes\n\nCheck it out and support it: ${productUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
      '_blank',
      'width=550,height=420'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1F2937] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">🏆</span>
            </div>
            <h2 className="text-white font-black" style={{ fontSize: '16px' }}>Share Your Rank Card</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Preview */}
          <div>
            <p className="text-gray-400 text-sm font-semibold mb-4">PREVIEW</p>
            <div className="flex justify-center">
              <div
                ref={cardRef}
                className="rounded-2xl border-2 space-y-5"
                style={{
                  width: '420px',
                  height: 'auto',
                  padding: '32px',
                  backgroundColor: '#2d3748',
                  borderColor: '#4a5568',
                  background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
                }}
              >
                {/* Top Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 text-white font-black rounded-full" style={{ backgroundColor: '#f97316', fontSize: '13px' }}>
                    🔥 RANKED
                  </span>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="font-black line-clamp-3" style={{ fontSize: '32px', color: '#ffffff', lineHeight: '1.2', marginBottom: '8px' }}>{product.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>{product.category}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6" style={{ borderTopColor: '#4a5568', borderTopWidth: '2px', paddingTop: '24px' }}>
                  <div>
                    <p className="font-black mb-3" style={{ color: '#a0aec0', fontSize: '12px', letterSpacing: '1px' }}>RANKING</p>
                    <p className="font-black" style={{ color: '#f97316', fontSize: '42px' }}>#{product.rank}</p>
                  </div>
                  <div>
                    <p className="font-black mb-3" style={{ color: '#a0aec0', fontSize: '12px', letterSpacing: '1px' }}>VOTES</p>
                    <p className="font-black" style={{ color: '#60a5fa', fontSize: '42px' }}>{product.totalVotes || 0}</p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTopColor: '#4a5568', borderTopWidth: '2px', paddingTop: '20px' }}>
                  <p className="font-bold" style={{ color: '#a0aec0', fontSize: '12px', letterSpacing: '1px' }}>RANKBID</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadImage}
                disabled={downloading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Saving...' : 'Save PNG'}
              </button>
              <button
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Image'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all border border-gray-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                </svg>
                Post to X
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.807 0-9.726h3.554v1.375c.429-.66 1.196-1.6 2.905-1.6 2.122 0 3.714 1.388 3.714 4.37v5.581zM5.337 8.855c-1.144 0-1.915-.762-1.915-1.715 0-.957.77-1.715 1.958-1.715 1.187 0 1.927.758 1.94 1.715 0 .953-.753 1.715-1.983 1.715zm1.946 11.597H3.392V9.726h3.891v10.726zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
                LinkedIn
              </button>
            </div>
          </div>

          {/* Share Text */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <p className="text-gray-400 text-xs font-black">SUGGESTED POST TEXT</p>
            <textarea
              readOnly
              value={`🎯 I just ranked #${product.rank} on RankBid!\n\n"${product.title}"\n\n📊 ${product.category}\n💪 ${product.totalVotes || 0} votes\n\nCheck it out and support it: ${productUrl}`}
              className="w-full bg-gray-900 text-gray-300 rounded p-3 text-sm font-mono border border-gray-700 resize-none"
              rows={6}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `🎯 I just ranked #${product.rank} on RankBid!\n\n"${product.title}"\n\n📊 ${product.category}\n💪 ${product.totalVotes || 0} votes\n\nCheck it out and support it: ${productUrl}`
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all text-sm"
            >
              {copied ? 'Text Copied!' : 'Copy Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
