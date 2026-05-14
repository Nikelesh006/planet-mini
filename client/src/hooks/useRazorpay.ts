import { useState } from 'react';
import { loadScript } from '@/utils/loadScript';

// Razorpay type declarations
declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill: {
        name: string;
        email: string;
        contact?: string;
      };
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      modal: {
        ondismiss: () => void;
      };
      theme: {
        color: string;
      };
    }) => {
      open: () => void;
      on: (event: string, handler: Function) => void;
    };
  }
}

interface RazorpayOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async (options: RazorpayOptions): Promise<RazorpayResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔧 Initializing Razorpay payment...');
      
      // Check if Razorpay is available
      if (typeof window === 'undefined') {
        throw new Error('Window is not defined');
      }

      // Load Razorpay script
      console.log('📦 Loading Razorpay script...');
      const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      console.log('✅ Razorpay script loaded successfully');

      // Check if Razorpay object is available
      if (!window.Razorpay) {
        throw new Error('Razorpay object not available after script load');
      }

      // Get the key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SoPV94HPAl2TGh';
      console.log('🔑 Using Razorpay key:', razorpayKey.substring(0, 15) + '...');

      // Create new Razorpay instance
      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description,
        order_id: options.order_id,
        prefill: options.prefill,
        handler: options.handler,
        modal: options.modal,
        theme: {
          color: '#000000'
        }
      });

      console.log('🚀 Opening Razorpay payment modal...');
      
      // Open payment modal
      razorpay.open();

      return new Promise((resolve, reject) => {
        // Override handler to resolve promise
        razorpay.on('payment.success', (response: RazorpayResponse) => {
          console.log('💳 Payment successful:', response);
          setIsLoading(false);
          resolve(response);
        });

        razorpay.on('payment.error', (error: any) => {
          console.error('❌ Payment error:', error);
          setIsLoading(false);
          setError(error.error?.description || error.message || 'Payment failed');
          reject(error);
        });

        razorpay.on('payment.dismiss', () => {
          console.log('👋 Payment modal dismissed');
          setIsLoading(false);
        });
      });

    } catch (err) {
      console.error('❌ Razorpay initialization error:', err);
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(errorMessage);
      return null;
    }
  };

  return {
    initializePayment,
    isLoading,
    error
  };
}
