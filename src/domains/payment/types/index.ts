
export interface Course {
  id: string;
  title?: string | undefined;
  topics: string[];
  instructorId?: string | undefined;
  subTitle?: string | undefined;
  category?: string | undefined;
  subCategory?: string | undefined;
  language?: string | undefined;
  subtitleLanguage?: string | undefined;
  level?: string | undefined;
  durationValue?: string | undefined;
  durationUnit?: string | undefined;
  description?: string | undefined;
  learningOutcomes: string[];
  targetAudience: string[];
  requirements: string[];
  thumbnail?: string | undefined;
  trailer?: string | undefined;
  status?: string | undefined;
  slug: string | undefined;
  rating: number | undefined;
  totalRatings: number | undefined;
  numberOfRating?: number | undefined;
  enrollments?: number | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
  price: number | undefined;
  discountPrice?: number | undefined;
  currency?: string | undefined;
}

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
