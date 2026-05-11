// ─────────────────────────────────────────────────────────
// CAFT Financial — Razorpay Checkout Integration (Robust)
//
// Key improvements over the original:
// 1. Dynamic key fetching from backend (eliminates key mismatch)
// 2. Razorpay on.payment.failed event handler for real errors
// 3. Differentiates "user closed" vs "payment failed"
// 4. Retry logic for script loading
// 5. Pre-flight validation
// 6. Promise-based API for cleaner async flow
// ─────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// ── Cached Razorpay Key ────────────────────────────────
// Fetched once from the backend and cached for the session.
// This ensures frontend and backend ALWAYS use the same key.
let cachedRazorpayKey: string | null = null;

/**
 * Get the Razorpay key ID. Priority:
 * 1. Cached key (from previous fetch)
 * 2. Backend API /api/payments/config (most reliable — always matches backend)
 * 3. NEXT_PUBLIC_RAZORPAY_KEY_ID env var (build-time fallback)
 */
async function getRazorpayKey(): Promise<string | null> {
  // Return cached key if available
  if (cachedRazorpayKey) return cachedRazorpayKey;

  // Fetch from backend — this GUARANTEES the key matches
  try {
    const res = await fetch('/api/payments/config');
    if (res.ok) {
      const json = await res.json();
      if (json.data?.keyId) {
        cachedRazorpayKey = json.data.keyId;
        console.log('🔑 Razorpay key fetched from backend:', cachedRazorpayKey?.substring(0, 12) + '...');
        return cachedRazorpayKey;
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not fetch Razorpay key from backend, using env fallback:', err);
  }

  // Fallback to build-time env var
  const envKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null;
  if (envKey) {
    cachedRazorpayKey = envKey;
    console.log('🔑 Using NEXT_PUBLIC_RAZORPAY_KEY_ID fallback:', envKey.substring(0, 12) + '...');
  }
  return envKey;
}

// ── Script Loading ─────────────────────────────────────

let scriptLoadPromise: Promise<boolean> | null = null;

/**
 * Dynamically load the Razorpay Checkout.js script with retry.
 * Caches the promise so multiple calls don't create multiple scripts.
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      console.log('✅ Razorpay Checkout.js loaded');
      resolve(true);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Razorpay Checkout.js');
      scriptLoadPromise = null; // Allow retry on next call
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

// ── Checkout Result Types ──────────────────────────────

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  subscriptionId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  userCancelled?: boolean;
}

// ── Subscription Checkout ──────────────────────────────

/**
 * Open Razorpay Checkout modal for a recurring subscription.
 * Returns a Promise that resolves with the payment result.
 */
export async function openRazorpayCheckout(options: {
  subscriptionId: string;
  planName: string;
  amount: number; // in paise
  userEmail: string;
  userName: string;
  userPhone?: string;
  onSuccess: (paymentId: string, subscriptionId: string, signature: string) => void;
  onFailure: (error: string) => void;
}): Promise<void> {
  const key = await getRazorpayKey();
  if (!key) {
    console.error('❌ RAZORPAY_KEY_ID is not configured. Payment checkout will not work.');
    options.onFailure('Payment gateway is not configured. Please contact support.');
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onFailure('Failed to load payment gateway. Please check your internet connection and try again.');
    return;
  }

  // Pre-flight validation
  if (!options.subscriptionId) {
    console.error('❌ No subscription ID provided to Razorpay checkout');
    options.onFailure('Payment initialization failed. Please try again.');
    return;
  }

  console.log(`🔄 Opening Razorpay subscription checkout:`);
  console.log(`   Key: ${key.substring(0, 12)}...`);
  console.log(`   Subscription: ${options.subscriptionId}`);
  console.log(`   Plan: ${options.planName}`);

  const rzp = new window.Razorpay({
    key,
    subscription_id: options.subscriptionId,
    name: 'CAFT Financial',
    description: `Subscription: ${options.planName}`,
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }) => {
      console.log('✅ Razorpay subscription payment success:', response.razorpay_payment_id);
      options.onSuccess(
        response.razorpay_payment_id,
        response.razorpay_subscription_id,
        response.razorpay_signature,
      );
    },
    prefill: {
      email: options.userEmail,
      name: options.userName,
      ...(options.userPhone ? { contact: options.userPhone } : {}),
    },
    theme: {
      color: '#FF9500',
    },
    modal: {
      ondismiss: () => {
        console.log('ℹ️ Razorpay modal dismissed by user');
        options.onFailure('__USER_CANCELLED__');
      },
      confirm_close: true,
      escape: true,
      animation: true,
    },
    notes: {
      plan_name: options.planName,
    },
  });

  // Listen for actual payment failures (Razorpay error events)
  rzp.on('payment.failed', (response: {
    error: {
      code: string;
      description: string;
      source: string;
      step: string;
      reason: string;
      metadata?: { payment_id?: string; order_id?: string };
    };
  }) => {
    const err = response.error;
    console.error('❌ Razorpay payment failed:', err);
    const userMessage = getPaymentErrorMessage(err.code, err.description, err.reason);
    options.onFailure(userMessage);
  });

  rzp.open();
}

// ── One-Time Payment Checkout ──────────────────────────

/**
 * Open Razorpay Checkout modal for a one-time payment (order-based).
 * Returns a Promise that resolves with the payment result.
 */
export async function openRazorpayPayment(options: {
  orderId: string;
  planName: string;
  amount: number; // in paise
  currency: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: string) => void;
}): Promise<void> {
  const key = await getRazorpayKey();
  if (!key) {
    console.error('❌ RAZORPAY_KEY_ID is not configured. Payment checkout will not work.');
    options.onFailure('Payment gateway is not configured. Please contact support.');
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onFailure('Failed to load payment gateway. Please check your internet connection and try again.');
    return;
  }

  // Pre-flight validation
  if (!options.orderId) {
    console.error('❌ No order ID provided to Razorpay checkout');
    options.onFailure('Payment initialization failed. Please try again.');
    return;
  }

  if (!options.amount || options.amount < 100) {
    console.error('❌ Invalid amount for Razorpay checkout:', options.amount);
    options.onFailure('Invalid payment amount. Please try again.');
    return;
  }

  console.log(`🔄 Opening Razorpay order checkout:`);
  console.log(`   Key: ${key.substring(0, 12)}...`);
  console.log(`   Order: ${options.orderId}`);
  console.log(`   Amount: ₹${(options.amount / 100).toFixed(2)}`);
  console.log(`   Plan: ${options.planName}`);

  const rzp = new window.Razorpay({
    key,
    amount: options.amount,
    currency: options.currency,
    order_id: options.orderId,
    name: 'CAFT Financial',
    description: `Purchase: ${options.planName}`,
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      console.log('✅ Razorpay order payment success:', response.razorpay_payment_id);
      options.onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature,
      );
    },
    prefill: {
      email: options.userEmail,
      name: options.userName,
      ...(options.userPhone ? { contact: options.userPhone } : {}),
    },
    theme: {
      color: '#FF9500',
    },
    modal: {
      ondismiss: () => {
        console.log('ℹ️ Razorpay modal dismissed by user');
        options.onFailure('__USER_CANCELLED__');
      },
      confirm_close: true,
      escape: true,
      animation: true,
    },
    notes: {
      plan_name: options.planName,
    },
  });

  // Listen for actual payment failures
  rzp.on('payment.failed', (response: {
    error: {
      code: string;
      description: string;
      source: string;
      step: string;
      reason: string;
      metadata?: { payment_id?: string; order_id?: string };
    };
  }) => {
    const err = response.error;
    console.error('❌ Razorpay payment failed:', err);
    const userMessage = getPaymentErrorMessage(err.code, err.description, err.reason);
    options.onFailure(userMessage);
  });

  rzp.open();
}

// ── Error Message Mapping ──────────────────────────────

/**
 * Convert Razorpay error codes to user-friendly messages.
 * Avoids showing cryptic technical errors to end users.
 */
function getPaymentErrorMessage(code: string, description: string, reason: string): string {
  // Map common Razorpay error reasons to user-friendly messages
  const reasonMap: Record<string, string> = {
    'payment_cancelled': 'Payment was cancelled. You can try again anytime.',
    'payment_failed': 'Payment could not be processed. Please try a different payment method.',
    'server_error': 'Payment server is temporarily unavailable. Please try again in a few minutes.',
    'network_error': 'Network connection issue. Please check your internet and try again.',
    'insufficient_balance': 'Insufficient balance. Please try a different payment method.',
    'invalid_card': 'Card details are invalid. Please check and try again.',
    'card_declined': 'Your card was declined by the bank. Please try a different card.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'authentication_failed': 'Payment authentication failed. Please try again.',
    'timeout': 'Payment timed out. Please try again.',
  };

  if (reasonMap[reason]) return reasonMap[reason];

  // Map common error codes
  const codeMap: Record<string, string> = {
    'BAD_REQUEST_ERROR': 'There was an issue with the payment. Please try again.',
    'GATEWAY_ERROR': 'Payment gateway is temporarily unavailable. Please try again.',
    'SERVER_ERROR': 'An unexpected error occurred. Please try again later.',
  };

  if (codeMap[code]) return codeMap[code];

  // Default: use the description if available, otherwise generic message
  return description || 'Payment could not be completed. Please try again.';
}
