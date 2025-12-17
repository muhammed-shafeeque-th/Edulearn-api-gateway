// Main facade service
export { BloomFilterFacade } from './bloom-filter.facade';

// Interfaces
export {
  IBloomFilterService,
  IBloomFilterStrategy,
} from './bloom-filter.interface';

// Strategies
export { EmailAvailabilityStrategy } from './email-availability.strategy';
export { CourseNameAvailabilityStrategy } from './course-name-availability.strategy';
export { BaseBloomFilterStrategy } from './base-bloom-filter.strategy';

// Configuration
export {
  BloomFilterConfig,
  BloomFilterServiceConfig,
  getBloomFilterConfig,
} from './bloom-filter.config';

// Legacy service (for backward compatibility)
export { EmailAvailabilityService } from './email-availability';
