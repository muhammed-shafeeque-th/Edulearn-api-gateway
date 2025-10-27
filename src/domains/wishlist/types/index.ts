import {
  CartItemData,
  WishlistData,
} from '@/domains/service-clients/user/proto/generated/user_service';

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
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
  price: number | undefined;
  discountPrice?: number | undefined;
  currency?: string | undefined;
  instructor: Instructor;
}

export interface Wishlist {
  id: string;
  userId: string;
  total: number;
  items: WishlistItem[];
  updatedAt: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  courseId: string;
  createdAt: string;
  course?: Course;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  email?: string | undefined;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
  description: string;
  isPublished: boolean;
  order: number;
  quiz: Quiz | undefined;
}

export interface Quiz {
  id: string;
  courseId: string;
  sectionId: string;
  title: string;
  description?: string | undefined;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
}

export interface Question {
  id: string;
  type: string;
  points?: number | undefined;
  timeLimit?: number | undefined;
  question: string;
  required: boolean;
  options: string[];
  correctAnswer: string;
  explanation?: string | undefined;
}

export interface Lesson {
  id: string;
  sectionId: string;
  isPreview: boolean;
  description: string;
  estimatedDuration: number;
  order: number;
  title: string;
  isPublished: boolean;
  contentType: string;
  contentUrl: string;
  metadata: ContentMetaData | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
}

export interface ContentMetaData {
  title?: string | undefined;
  fileName?: string | undefined;
  mimeType?: string | undefined;
  fileSize?: string | undefined;
  url?: string | undefined;
  // Record<string, string>;
}
