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

export interface Order {
  id: string;
  userId: string;
  items: OrderItems[];
  paymentDetails?: PaymentDetails | undefined;
  totalAmount: number;
  discount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
