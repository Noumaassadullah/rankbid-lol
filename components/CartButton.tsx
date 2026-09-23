'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative p-1.5 md:p-2 text-[#1F2937] hover:bg-gray-100 transition-colors rounded-lg"
      title="Shopping Cart"
    >
      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  );
}
