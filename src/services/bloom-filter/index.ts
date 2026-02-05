// Main facade service
export { BloomFilterFacade } from './bloom-filter.facade';

// Interfaces
export {
  IBloomFilterService,
  IBloomFilterStrategy,
} from './bloom-filter.interface';

export { EmailAvailabilityStrategy } from './email-availability.strategy';
export { CourseNameAvailabilityStrategy } from './course-name-availability.strategy';
export { BaseBloomFilterStrategy } from './base-bloom-filter.strategy';

export {
  BloomFilterConfig,
  BloomFilterServiceConfig,
  getBloomFilterConfig,
} from './bloom-filter.config';

export { EmailAvailabilityService } from './email-availability';
