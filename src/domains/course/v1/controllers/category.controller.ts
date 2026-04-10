import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { CourseService } from '@/domains/service-clients/course';
import { TYPES } from '@/services/di';
import { LoggingService } from '@/services/observability/logging/logging.service';
import { TracingService } from '@/services/observability/tracing/trace.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';
import { Trace, MonitorGrpc } from '@/services/decorators/decorators';
import validateSchema from '../../../../services/security/validate-schema';
import { attachMetadata } from '../utils/attach-metadata';
import { getAllCategoriesSchema } from '../schemas/category/get-all-categories.schema';
import { createCategorySchema } from '../schemas/category/create-category.schema';
import { updateCategorySchema } from '../schemas/category/update-category.schema';
import {
  deleteCategorySchema,
  toggleCategoryStatusSchema,
} from '../schemas/category/delete-category.schema';
import { CATEGORY_MESSAGES } from '../utils/response-messages';
import { CategoryResponseMapper } from '../utils/mappers';
import { Observe } from '@/services/observability/decorators';
import { config } from '@/config';

@injectable()
@Observe({ logLevel: config.observability.logger.logLevel as 'debug' })
export class CategoryController {
  constructor(
    @inject(TYPES.CourseService) private courseServiceClient: CourseService,
    @inject(TYPES.LoggingService) private logger: LoggingService,
    @inject(TYPES.TracingService) private tracer: TracingService,
    @inject(TYPES.MetricsService) private monitor: MetricsService
  ) {}

  // @Trace('CategoryController.getAllCategories')
  // @MonitorGrpc('CourseService', 'getAllCategories')
  async getAllCategories(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        includeDeleted: req.query.includeDeleted === 'true',
        activeOnly: req.query.activeOnly === 'true',
      },
      getAllCategoriesSchema
    )!;

    const { categories } = await this.courseServiceClient.getAllCategories(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(CATEGORY_MESSAGES.CATEGORIES_FETCHED.statusCode)
      .success(
        (categories?.categories ?? []).map(CategoryResponseMapper.toCategory),
        CATEGORY_MESSAGES.CATEGORIES_FETCHED.message
      );
  }
  async getCategoriesStats(req: Request, res: Response) {
    // const validPayload = validateSchema(
    //   {
    //     includeDeleted: req.query.includeDeleted === 'true',
    //     activeOnly: req.query.activeOnly === 'true',
    //   },
    //   getAllCategoriesSchema
    // )!;

    const { stats } = await this.courseServiceClient.getCategoriesStats(
      {},
      { metadata: attachMetadata(req) }
    );

    console.log('Category stats : ' + JSON.stringify(stats, null, 2));

    return new ResponseWrapper(res)
      .status(CATEGORY_MESSAGES.CATEGORIES_FETCHED.statusCode)
      .success(stats?.stats, CATEGORY_MESSAGES.CATEGORIES_FETCHED.message);
  }

  // @Trace('CategoryController.createCategory')
  // @MonitorGrpc('CourseService', 'createCategory')
  async createCategory(req: Request, res: Response) {
    const validPayload = validateSchema(req.body, createCategorySchema)!;

    // Auto-generate slug from name if not provided
    const slug =
      validPayload.slug ||
      validPayload.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const { category } = await this.courseServiceClient.createCategory(
      { ...validPayload, slug, parentId: validPayload.parentId ?? undefined },
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(CATEGORY_MESSAGES.CATEGORY_CREATED.statusCode)
      .success(
        category ? CategoryResponseMapper.toCategory(category) : null,
        CATEGORY_MESSAGES.CATEGORY_CREATED.message
      );
  }

  // @Trace('CategoryController.updateCategory')
  // @MonitorGrpc('CourseService', 'updateCategory')
  async updateCategory(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, id: req.params.id },
      updateCategorySchema
    )!;

    const { category } = await this.courseServiceClient.updateCategory(
      { ...validPayload, parentId: validPayload.parentId ?? undefined },
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(CATEGORY_MESSAGES.CATEGORY_UPDATED.statusCode)
      .success(
        category ? CategoryResponseMapper.toCategory(category) : null,
        CATEGORY_MESSAGES.CATEGORY_UPDATED.message
      );
  }

  // @Trace('CategoryController.toggleCategoryStatus')
  // @MonitorGrpc('CourseService', 'toggleCategoryStatus')
  async toggleCategoryStatus(req: Request, res: Response) {
    const validPayload = validateSchema(
      { id: req.params.id },
      toggleCategoryStatusSchema
    )!;

    const { category } = await this.courseServiceClient.toggleCategoryStatus(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(CATEGORY_MESSAGES.CATEGORY_STATUS_TOGGLED.statusCode)
      .success(
        category ? CategoryResponseMapper.toCategory(category) : null,
        CATEGORY_MESSAGES.CATEGORY_STATUS_TOGGLED.message
      );
  }

  @Trace('CategoryController.deleteCategory')
  @MonitorGrpc('CourseService', 'deleteCategory')
  async deleteCategory(req: Request, res: Response) {
    const validPayload = validateSchema(
      { id: req.params.id },
      deleteCategorySchema
    )!;

    await this.courseServiceClient.deleteCategory(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CATEGORY_MESSAGES.CATEGORY_DELETED.statusCode)
      .success({ deleted: true }, CATEGORY_MESSAGES.CATEGORY_DELETED.message);
  }
}
