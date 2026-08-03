export const cartEndpoints = {
  myCarts: '/me/carts',
  userCart: '/:userId/carts',
  carts: '/carts',
} as const;

export const wishlistEndpoints = {
  myWishlist: '/me/wishlists',
  userWishlist: '/:userId/wishlists',
  wishlists: '/wishlists',
} as const;
export const walletEndpoints = {
  me: '/me/wallets',
  myWalletTransactions: '/me/wallets/transactions',
} as const;

export const instructorEndpoints = {
  myStudents: '/me/students',
  base: '/',
  stats: '/stats',
  register: '/register',
  instructorStats: '/:instructorId/stats',
  instructorCoursesStats: '/:instructorId/courses/stats',
  instructorCourseStats: '/:instructorId/courses/:courseId/stats',
} as const;

export const userEndpoints = {
  base: '/',
  stats: '/stats',
  online: '/online',
  usernameCheck: '/username-check',
  me: '/me',
  myInstructors: '/me/instructors',
  myStudents: '/me/students',
  instructors: '/instructors',
  instructorsStats: '/instructors/stats',
  instructorRegister: '/instructors/register',
  instructorStats: '/instructors/:instructorId/stats',
  instructorCoursesStats: '/instructors/:instructorId/courses/stats',
  instructorCourseStats: '/instructors/:instructorId/courses/:courseId/stats',
  user: '/:userId',
  block: '/:userId/block',
  unblock: '/:userId/unblock',
} as const;
