import { CategoryData } from "@/domains/service-clients/course/proto/generated/course/types/category";
import { Category } from "../../types";

export class CategoryResponseMapper {
  public static toCategory = (cat: CategoryData): Category => {
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      icon: cat.icon ?? '',
      color: cat.color ?? '#3B82F6',
      isActive: cat.isActive,
      parentId: cat.parentId ?? null,
      courseCount: cat.courseCount ?? 0,
      order: cat.order ?? 0,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      deletedAt: cat.deletedAt ?? null,
      subcategories: (cat.subcategories ?? []).map(CategoryResponseMapper.toCategory),
    };
  };
}
