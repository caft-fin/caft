// ─────────────────────────────────────────────────────────
// CAFT Financial — Razorpay Checkout Integration
// ─────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SW0DSwBCxvRLsn';

/**
 * Dynamically load the Razorpay Checkout.js script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay Checkout modal for a recurring subscription
 */
export async function openRazorpayCheckout(options: {
  subscriptionId: string;
  planName: string;
  amount: number; // in paise
  userEmail: string;
  userName: string;
  onSuccess: (paymentId: string, subscriptionId: string, signature: string) => void;
  onFailure: (error: string) => void;
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onFailure('Failed to load payment gateway. Please try again.');
    return;
  }

  const rzp = new window.Razorpay({
    key: RAZORPAY_KEY,
    subscription_id: options.subscriptionId,
    name: 'CAFT Financial',
    description: `Subscription: ${options.planName}`,
    handler: (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
      options.onSuccess(
        response.razorpay_payment_id,
        response.razorpay_subscription_id,
        response.razorpay_signature,
      );
    },
    prefill: {
      email: options.userEmail,
      name: options.userName,
    },
    theme: {
      color: '#FF9500',
    },
    modal: {
      ondismiss: () => {
        options.onFailure('Payment cancelled');
      },
    },
  });

  rzp.open();
}

/**
 * Open Razorpay Checkout modal for a one-time payment (order-based)
 */
export async function openRazorpayPayment(options: {
  orderId: string;
  planName: string;
  amount: number; // in paise
  currency: string;
  userEmail: string;
  userName: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: string) => void;
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onFailure('Failed to load payment gateway. Please try again.');
    return;
  }

  const rzp = new window.Razorpay({
    key: RAZORPAY_KEY,
    amount: options.amount,
    currency: options.currency,
    order_id: options.orderId,
    name: 'CAFT Financial',
    description: `Purchase: ${options.planName}`,
    handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      options.onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature,
      );
    },
    prefill: {
      email: options.userEmail,
      name: options.userName,
    },
    theme: {
      color: '#FF9500',
    },
    modal: {
      ondismiss: () => {
        options.onFailure('Payment cancelled');
      },
    },
  });

  rzp.open();
}
