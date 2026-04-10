
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  parentId: string | null;
  courseCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  subcategories: Category[];
}
