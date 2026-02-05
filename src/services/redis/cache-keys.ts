export const RESPONSE_CACHE_KEYS = {
  userService: {
    getUserById: (userId: string) => `userService:getUserById:${userId}`,
    getUsersStats: () => 'userService:getUsersStats',
    getUserByEmail: (email: string) => `userService:getUserByEmail:${email}`,
    getUserProfile: (userId: string) => `userService:getUserProfile:${userId}`,
    listUsers: (page: number = 1, size: number = 10) =>
      `userService:listUsers:page:${page}:size:${size}`,
    getInstructorsStats: () => 'userService:getInstructorsStats',
    searchUsers: (query: string) => `userService:searchUsers:query:${query}`,
    // Add more user related cache keys as needed...
  },
  orderService: {
    getOrderById: (orderId: string) => `orderService:getOrderById:${orderId}`,
    getOrdersForUser: (userId: string, status?: string) =>
      `orderService:getOrdersForUser:${userId}${status ? `:status:${status}` : ''}`,
    listOrders: (page: number = 1, size: number = 10) =>
      `orderService:listOrders:page:${page}:size:${size}`,
    getOrderSummary: (userId: string) => `orderService:getOrderSummary:${userId}`,
    getOrderStatus: (orderId: string) => `orderService:getOrderStatus:${orderId}`,
    // Add more order related cache keys as needed...
  },
  courseService: {
    // Course basic info
    getCourseById: (courseId: string) => `courseService:getCourseById:${courseId}`,
    getAllCourses: (category?: string, page: number = 1, size: number = 10) =>
      `courseService:getAllCourses${category ? `:category:${category}` : ''}:page:${page}:size:${size}`,
    getCoursesForInstructor: (instructorId: string) =>
      `courseService:getCoursesForInstructor:${instructorId}`,
    getCourseSummary: (courseId: string) => `courseService:getCourseSummary:${courseId}`,

    // Analytics
    getCourseAnalytics: (courseId: string, range?: string) =>
      `courseService:getCourseAnalytics:${courseId}${range ? `:range:${range}` : ''}`,
    getInstructorCourseStats: (instructorId: string, year?: string) =>
      `courseService:getInstructorCourseStats:${instructorId}${year ? `:year:${year}` : ''}`,
    getCourseEnrollmentTrend: (courseId: string, from?: string, to?: string) =>
      `courseService:getCourseEnrollmentTrend:${courseId}${from ? `:from:${from}` : ''}${to ? `:to:${to}` : ''}`,
    getTopCourses: (limit: number = 10) => `courseService:getTopCourses:limit:${limit}`,

    // Enrollments
    getEnrollmentsForCourse: (courseId: string, page: number = 1, size: number = 10) =>
      `courseService:getEnrollmentsForCourse:${courseId}:page:${page}:size:${size}`,
    getEnrollmentDetail: (enrollmentId: string) => `courseService:getEnrollmentDetail:${enrollmentId}`,
    getUserEnrollments: (userId: string, status?: string) =>
      `courseService:getUserEnrollments:${userId}${status ? `:status:${status}` : ''}`,

    // Progress
    getUserCourseProgress: (userId: string, courseId: string) =>
      `courseService:getUserCourseProgress:${userId}:${courseId}`,
    getCourseProgressStats: (courseId: string) => `courseService:getCourseProgressStats:${courseId}`,

    // Reviews
    getCourseReviews: (courseId: string, page: number = 1, size: number = 10) =>
      `courseService:getCourseReviews:${courseId}:page:${page}:size:${size}`,
    getUserReviewForCourse: (courseId: string, userId: string) =>
      `courseService:getUserReviewForCourse:${courseId}:${userId}`,
    getCourseRatings: (courseId: string) => `courseService:getCourseRatings:${courseId}`,

    // Lessons
    getLessonsForCourse: (courseId: string) => `courseService:getLessonsForCourse:${courseId}`,
    getLessonById: (lessonId: string) => `courseService:getLessonById:${lessonId}`,
    getUserLessonProgress: (userId: string, lessonId: string) =>
      `courseService:getUserLessonProgress:${userId}:${lessonId}`,

    // Certificates
    getUserCertificate: (userId: string, courseId: string) =>
      `courseService:getUserCertificate:${userId}:${courseId}`,
    getCourseCertificates: (courseId: string, page: number = 1, size: number = 10) =>
      `courseService:getCourseCertificates:${courseId}:page:${page}:size:${size}`,

    // Misc/etcs
    searchCourses: (query: string, page: number = 1, size: number = 10) =>
      `courseService:searchCourses:query:${query}:page:${page}:size:${size}`,
    getCourseOutline: (courseId: string) => `courseService:getCourseOutline:${courseId}`,
    getCoursePrerequisites: (courseId: string) => `courseService:getCoursePrerequisites:${courseId}`,
    // Add more as needed
  }
} as const;
