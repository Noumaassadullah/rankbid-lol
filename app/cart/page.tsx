'use client';

import Header from '@/components/Header';
import { useCart, CartItem } from '@/contexts/CartContext';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const POSITION_PRICES: { [key: number]: number } = {
  1: 5,
  2: 3,
  3: 1,
};

export default function CartPage() {
  const { items, removeItem, updateItem, clearCart, totalPrice } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutMessage('');

    try {
      const response = await fetch('/api/premium-listings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            listingId: item.listingId,
            position: item.position,
            founderName: item.founderName,
            founderEmail: item.founderEmail,
            founderPhone: item.founderPhone,
            founderWebsite: item.founderWebsite,
            founderTwitter: item.founderTwitter,
            founderLinkedin: item.founderLinkedin,
            founderInstagram: item.founderInstagram,
            founderFacebook: item.founderFacebook,
            founderTiktok: item.founderTiktok,
            founderYoutube: item.founderYoutube,
            founderGithub: item.founderGithub,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Checkout failed');
      }

      const result = await response.json();
      setCheckoutMessage('✓ Checkout successful! Redirecting...');
      clearCart();
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      setCheckoutMessage(`✗ Error: ${error.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-black text-gray-900">Shopping Cart</h1>
          </div>
          <p className="text-gray-600 font-semibold">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Cart is Empty</h2>
            <p className="text-gray-600 font-semibold mb-8">Add premium listings to your cart to get started!</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, idx) => (
                <CartItemCard
                  key={item.listingId}
                  item={item}
                  index={idx}
                  onRemove={() => removeItem(item.listingId)}
                  onUpdate={(updates) => updateItem(item.listingId, updates)}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 sticky top-24 h-fit">
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-black text-gray-900">Order Summary</h2>

                {/* Items Breakdown */}
                <div className="space-y-3 border-t-2 border-gray-300 pt-4">
                  {items.map(item => (
                    <div key={item.listingId} className="flex justify-between text-sm">
                      <div>
                        <p className="font-semibold text-gray-900 truncate">{item.listingTitle}</p>
                        <p className="text-gray-600 text-xs">Position #{item.position}</p>
                      </div>
                      <p className="font-bold text-gray-900 whitespace-nowrap ml-2">${item.price}</p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-bold text-gray-900">Subtotal:</span>
                    <span className="font-bold text-gray-900">${totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Tax:</span>
                    <span className="font-bold text-gray-900">$0.00</span>
                  </div>
                </div>

                <div className="bg-white border-2 border-orange-600 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-xl font-black text-gray-900">Total:</span>
                    <span className="text-2xl font-black text-orange-600">${totalPrice}</span>
                  </div>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <p className="text-xs text-blue-900 font-semibold">
                    ✓ <span className="font-black">Manual Verification</span> — After payment, an admin will verify and activate your premium listings within 24 hours.
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || items.length === 0}
                  className="w-full px-6 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      💳 Checkout • ${totalPrice}
                    </>
                  )}
                </button>

                {checkoutMessage && (
                  <div className={`text-sm font-semibold p-3 rounded-lg text-center ${
                    checkoutMessage.startsWith('✗')
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-green-100 text-green-900 border border-green-300'
                  }`}>
                    {checkoutMessage}
                  </div>
                )}

                {/* Clear Cart */}
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your cart?')) {
                        clearCart();
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-300 text-sm"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CartItemCard({
  item,
  index,
  onRemove,
  onUpdate,
}: {
  item: CartItem;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<CartItem>) => void;
}) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-900 mb-1">{item.listingTitle}</h3>
          <p className="text-sm text-gray-600 font-semibold">Listing ID: {item.listingId}</p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove from cart"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Position & Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-semibold mb-1">POSITION</p>
          <div className="flex items-center gap-2">
            <select
              value={item.position}
              onChange={(e) => {
                const newPosition = parseInt(e.target.value);
                const newPrice = POSITION_PRICES[newPosition] || 5;
                onUpdate({ position: newPosition, price: newPrice });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[1, 2, 3].map(pos => (
                <option key={pos} value={pos}>
                  #{pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3">
          <p className="text-xs text-orange-700 font-black mb-1">PRICE</p>
          <p className="text-2xl font-black text-orange-600">${item.price}</p>
        </div>
      </div>

      {/* Founder Info */}
      <div className="border-t-2 border-gray-300 pt-4 space-y-2">
        <h4 className="font-bold text-gray-900 text-sm">Founder Details:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600 text-xs font-semibold">Name</p>
            <p className="font-semibold text-gray-900">{item.founderName}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-semibold">Email</p>
            <p className="font-semibold text-gray-900 text-xs break-all">{item.founderEmail}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-semibold">Phone</p>
            <p className="font-semibold text-gray-900">{item.founderPhone}</p>
          </div>
          {item.founderWebsite && (
            <div>
              <p className="text-gray-600 text-xs font-semibold">Website</p>
              <p className="font-semibold text-blue-600 text-xs truncate">{item.founderWebsite}</p>
            </div>
          )}
        </div>

        {/* Social Links */}
        {(item.founderTwitter || item.founderLinkedin || item.founderInstagram || item.founderGithub) && (
          <div className="pt-2">
            <p className="text-gray-600 text-xs font-semibold mb-1">Social Media:</p>
            <div className="flex flex-wrap gap-1">
              {item.founderTwitter && <span className="px-2 py-1 bg-blue-100 text-blue-900 text-xs rounded font-semibold">Twitter: {item.founderTwitter}</span>}
              {item.founderLinkedin && <span className="px-2 py-1 bg-blue-100 text-blue-900 text-xs rounded font-semibold">LinkedIn</span>}
              {item.founderInstagram && <span className="px-2 py-1 bg-pink-100 text-pink-900 text-xs rounded font-semibold">IG: {item.founderInstagram}</span>}
              {item.founderGithub && <span className="px-2 py-1 bg-gray-200 text-gray-900 text-xs rounded font-semibold">GitHub: {item.founderGithub}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
