'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';
import { CartProvider } from '@/contexts/CartContext';

export function Providers({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <CartProvider>
        {children}
      </CartProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CartProvider>
        {children}
      </CartProvider>
    </GoogleOAuthProvider>
  );
}
