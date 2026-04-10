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
  students?: number | undefined;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
  price: number | undefined;
  discountPrice?: number | undefined;
  currency?: string | undefined;
  instructor: User;
}

export interface CourseMetadata {
  id: string;
  title: string;
  topics: string[];
  instructorId: string;
  subTitle: string;
  category: string;
  subCategory: string;
  language: string;
  subtitleLanguage: string;
  level: string;
  durationValue: string;
  durationUnit: string;
  description?: string | undefined;
  learningOutcomes: string[];
  targetAudience: string[];
  requirements: string[];
  thumbnail?: string | undefined;
  trailer?: string | undefined;
  status: string;
  slug: string;
  rating: number;
  numberOfRating: number;
  students: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
  price?: number | undefined;
  noOfLessons: number;
  noOfModules: number;
  noOfQuizzes: number;
  discountPrice?: number | undefined;
  currency?: string | undefined;
  instructor: User | undefined;
}


export interface CourseInfo {
  thumbnail: string;
  id: string;
  slug: string;
  status: string;
  title: string;
  level: string;
  rating: number;
  totalRatings: number;
  students: number;
  durationValue: string;
  durationUnit: string;
  price: number;
  discountPrice: number | undefined;
  instructor: User;
}


export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string | undefined;
}

export interface Module {
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
  moduleId: string;
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
  options: QuestionOption[];
  correctAnswer?: string;
  explanation?: string | undefined;
}

interface QuestionOption {
  value: string;
  isCorrect: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
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
