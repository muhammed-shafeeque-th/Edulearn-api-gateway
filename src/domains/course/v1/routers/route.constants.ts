export const courseEndpoints = {
  base: '/',
  instructor: '/instructor/:instructorId',
  course: '/:courseId',
  analytics: '/:courseId/analytics',
  stats: '/stats',
  reviews: '/:courseId/reviews',
  slug: '/slug/:slug',
  publish: '/:courseId/publish',
  unpublish: '/:courseId/unpublish',
  related: '/:courseId/related',
  enroll: '/:courseId/enroll',
  featured: '/featured',
  module: '/:courseId/modules/:moduleId',
  modules: '/:courseId/modules/',
  lesson: '/:courseId/modules/:moduleId/lessons/:lessonId',
  lessons: '/:courseId/modules/:moduleId/lessons',
  quizzes: '/:courseId/modules/:moduleId/quizzes',
  quiz: '/:courseId/modules/:moduleId/quizzes/:quizId',
} as const;

export const categoryEndpoints = {
  categories: '/categories',
  stats: '/categories/stats',
  category: '/categories/:id',
  status: '/categories/:id/toggle-status',
};
