import { BaseBloomFilterStrategy } from './base-bloom-filter.strategy';
import { BloomFilterConfig } from './bloom-filter.config';
import { RedisService } from '@/services/redis';
import { CourseService } from '@/domains/service-clients/course';

export class CourseNameAvailabilityStrategy extends BaseBloomFilterStrategy {
  private courseService = CourseService.getInstance();

  constructor(redis: RedisService, config: BloomFilterConfig) {
    super(redis, config);
  }

  protected getFilterType(): string {
    return 'courseName';
  }

  protected async seedFromDatabase(): Promise<void> {
    try {
      this.logger.info('Seeding course name bloom filter from database...', {
        ctx: CourseNameAvailabilityStrategy.name,
      });

      // Get all courses from the database with pagination
      let allCourseNames: string[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await this.courseService.getAllCourse({
          params: {
            pagination: {
              page,
              pageSize: limit,
              sortBy: 'createdAt',
              sortOrder: 'DESC',
            },
            filters: {
              category: [],
              level: []
            },
          },
        });
        console.log(
          'Course response in CourseAvailabilityStrategy ' +
            JSON.stringify(response, null, 2)
        );

        if (
          !response.courses ||
          !response.courses.courses ||
          response.courses.courses.length === 0
        ) {
          hasMore = false;
          break;
        }

        const courseNames = response.courses.courses
          .map(course => course.title)
          .filter((name): name is string => typeof name === 'string');

        allCourseNames = allCourseNames.concat(courseNames);

        // Check if we've reached the end
        if (response.courses.courses.length < limit) {
          hasMore = false;
        } else {
          page++;
        }

        // Safety check to prevent infinite loops
        if (page > 100) {
          this.logger.warn(
            'Reached maximum page limit while seeding course names',
            {
              ctx: CourseNameAvailabilityStrategy.name,
              maxPages: 100,
            }
          );
          break;
        }
      }

      this.logger.info(
        `Seeding ${allCourseNames.length} course names to bloom filter`,
        {
          ctx: CourseNameAvailabilityStrategy.name,
        }
      );

      allCourseNames.forEach(courseName => {
        if (courseName && typeof courseName === 'string') {
          this.bloomFilter.add(courseName.toLowerCase().trim());
        }
      });

      await this.persistFilter();

      this.logger.info('Course name bloom filter seeded successfully', {
        ctx: CourseNameAvailabilityStrategy.name,
        count: allCourseNames.length,
      });
    } catch (error) {
      this.logger.error(
        'Error seeding course name bloom filter from database:',
        {
          error,
          ctx: CourseNameAvailabilityStrategy.name,
        }
      );
      throw error;
    }
  }

  protected async checkInDatabase(courseName: string): Promise<boolean> {
    try {
      const normalizedCourseName = courseName.toLowerCase().trim();

      // Use pagination to search for the course name
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await this.courseService.getAllCourse({
          params: {
            pagination: {
              page,
              pageSize: limit,
              sortBy: 'createdAt',
              sortOrder: 'DESC',
            },
            filters: {
              category: [],
              level: []
            },
          },
        });

        if (
          !response.courses ||
          !response.courses.courses ||
          response.courses.courses.length === 0
        ) {
          break;
        }

        // Check if the course name exists in this batch
        const exists = response.courses.courses.some(
          course =>
            course.title &&
            course.title.toLowerCase().trim() === normalizedCourseName
        );

        if (exists) {
          return true;
        }

        // Check if we've reached the end
        if (response.courses.courses.length < limit) {
          hasMore = false;
        } else {
          page++;
        }

        // Safety check to prevent infinite loops
        if (page > 10) {
          this.logger.warn(
            'Reached maximum page limit while checking course name',
            {
              ctx: CourseNameAvailabilityStrategy.name,
              courseName: normalizedCourseName,
              maxPages: 10,
            }
          );
          break;
        }
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking course name in database:', {
        error,
        courseName,
        ctx: CourseNameAvailabilityStrategy.name,
      });
      throw error;
    }
  }
}
