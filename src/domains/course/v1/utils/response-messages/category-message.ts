import { HttpStatus } from "@/shared/constants";

export const CATEGORY_MESSAGES = {
    CATEGORIES_FETCHED: { statusCode: HttpStatus.OK, message: 'Categories fetched successfully' },
    CATEGORY_CREATED: { statusCode: HttpStatus.CREATED, message: 'Category created successfully' },
    CATEGORY_UPDATED: { statusCode: HttpStatus.OK, message: 'Category updated successfully' },
    CATEGORY_DELETED: { statusCode: HttpStatus.OK, message: 'Category deleted successfully' },
    CATEGORY_STATUS_TOGGLED: { statusCode: HttpStatus.OK, message: 'Category status updated successfully' },
};