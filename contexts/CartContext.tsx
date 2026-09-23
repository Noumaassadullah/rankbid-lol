'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  listingId: string;
  listingTitle: string;
  position: number;
  price: number;
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
  addedAt: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  updateItem: (listingId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rankbid-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rankbid-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.listingId === item.listingId);
      if (existing) {
        return prev.map(i => i.listingId === item.listingId ? item : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (listingId: string) => {
    setItems(prev => prev.filter(i => i.listingId !== listingId));
  };

  const updateItem = (listingId: string, updates: Partial<CartItem>) => {
    setItems(prev => prev.map(i => i.listingId === listingId ? { ...i, ...updates } : i));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
