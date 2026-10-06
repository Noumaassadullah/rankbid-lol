import { useState } from 'react';

interface CheckoutResponse {
  success: boolean;
  paymentRequired?: boolean;
  paymentMethod?: string;
  initiatePaymentUrl?: string;
  paymentData?: {
    premiumListingId: string;
    amount: number;
    email: string;
    phone: string;
    name: string;
  };
  premiumListings?: any[];
  redirectUrl?: string;
  message?: string;
  error?: string;
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    items: any[],
    paymentMethod: string
  ): Promise<CheckoutResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create premium listings
      const checkoutResponse = await fetch('/api/premium-listings/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          paymentMethod,
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = (await checkoutResponse.json()) as CheckoutResponse;

      // Step 2: If payment is required, initiate payment gateway
      if (data.paymentRequired && data.paymentMethod === 'rapid-gateway' && data.paymentData) {
        const paymentResponse = await fetch('/api/payment/rapid-gateway/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.paymentData),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.error || 'Failed to initiate payment');
        }

        const paymentData = await paymentResponse.json();
        setIsLoading(false);

        // Redirect to Rapid Gateway
        if (paymentData.redirectUrl) {
          window.location.href = paymentData.redirectUrl;
          return paymentData;
        }
      }

      setIsLoading(false);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Payment processing failed';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Payment error:', err);
      return null;
    }
  };

  return {
    isLoading,
    error,
    initiatePayment,
  };
}
