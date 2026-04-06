export type PaymentProvider = 'paypal' | 'razorpay' | 'stripe';

export interface OrderItems {
  courseId: string;
  price: number;
}

export interface PaymentDetails {
  paymentId: string;
  provider: string;
  providerOrderId?: string | undefined;
  paymentStatus: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  orderId: string;
  providerOrderId: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayPalPaymentSession {
  orderId: string;
  /** PayPal redirect URL */
  approvalLink: string;
  amount: number;
  currency: string;
}

export interface RazorpayPaymentSession {
  providerOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

export interface StripePaymentSession {
  sessionId: string;
  publicKey: string;
  clientSecret: string;
  /** Stripe hosted checkout URL (optional) */
  url: string;
  amount: number;
  currency: string;
}
