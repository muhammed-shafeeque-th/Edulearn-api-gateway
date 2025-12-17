export interface IBloomFilterService {
  /**
   * Initialize the bloom filter service
   */
  initialize(): Promise<void>;

  /**
   * Check if an email is available (not already taken)
   */
  isEmailAvailable(email: string): Promise<boolean>;

  /**
   * Check if a course name is available (not already taken)
   */
  isCourseNameAvailable(courseName: string): Promise<boolean>;

  /**
   * Add an email to the bloom filter
   */
  addEmail(email: string): Promise<void>;

  /**
   * Add a course name to the bloom filter
   */
  addCourseName(courseName: string): Promise<void>;

  /**
   * Get bloom filter statistics
   */
  getStatistics(): Promise<{
    emailFilterSize: number;
    courseNameFilterSize: number;
    emailFalsePositiveRate: number;
    courseNameFalsePositiveRate: number;
  }>;
}

export interface IBloomFilterStrategy {
  initialize(): Promise<void>;
  isAvailable(item: string): Promise<boolean>;
  add(item: string): Promise<void>;
  getStatistics(): Promise<{ size: number; falsePositiveRate: number }>;
}
