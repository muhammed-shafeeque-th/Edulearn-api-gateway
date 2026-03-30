import { CourseInfo } from '@/domains/course/v1/types';

export interface Cart {
  id: string;
  userId: string;
  total: number;
  items: CartItem[];
  updatedAt: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  courseId: string;
  createdAt: string;
  course?: CourseInfo;
}
