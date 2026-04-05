import { CourseInfo } from "@/domains/course/v1/types";


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
  course?: CourseInfo;
}
