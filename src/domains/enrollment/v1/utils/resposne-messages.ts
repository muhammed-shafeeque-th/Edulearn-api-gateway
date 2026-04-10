import { HttpStatus } from '@/shared/constants/http-status';

// --- ENROLLMENT_MESSAGES definition with message and statusCode ---
export const ENROLLMENT_MESSAGES = {
  GET_REVIEWS_BY_COURSE: {
    message: 'Fetched course reviews successfully.',
    statusCode: HttpStatus.OK,
  },
  GET_REVIEW: {
    message: 'Fetched review successfully.',
    statusCode: HttpStatus.OK,
  },
  SUBMIT_COURSE_REVIEW: {
    message: 'Course review submitted successfully.',
    statusCode: HttpStatus.CREATED,
  },
  DELETE_REVIEW: {
    message: 'Review deleted successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  UPDATE_REVIEW: {
    message: 'Review updated successfully.',
    statusCode: HttpStatus.OK,
  },
  GET_ENROLLMENT: {
    message: 'Fetched enrollment successfully.',
    statusCode: HttpStatus.OK,
  },
  CHECK_ENROLLMENT: {
    message: 'Checked enrollment status successfully.',
    statusCode: HttpStatus.OK,
  },
  GET_USER_ENROLLMENTS: {
    message: 'Fetched user enrollments successfully.',
    statusCode: HttpStatus.OK,
  },
  DELETE_ENROLLMENT: {
    message: 'Enrollment deleted successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  UPDATE_ENROLLMENT: {
    message: 'Enrollment updated successfully.',
    statusCode: HttpStatus.OK,
  },
  GET_PROGRESS: {
    message: 'Fetched progress successfully.',
    statusCode: HttpStatus.OK,
  },
  GET_PROGRESS_BY_ENROLLMENT: {
    message: 'Fetched progress by enrollment successfully.',
    statusCode: HttpStatus.OK,
  },
  UPDATE_LESSON_PROGRESS: {
    message: 'Lesson progress updated successfully.',
    statusCode: HttpStatus.OK,
  },
  SUBMIT_QUIZ_PROGRESS: {
    message: 'Quiz progress submitted successfully.',
    statusCode: HttpStatus.OK,
  },
  DELETE_PROGRESS: {
    message: 'Progress deleted successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  GET_VIDEO_PLAYBACK_REFRESH_URL: {
    message: 'Video playback refresh URL fetched successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  GET_SIGNED_VIDEO_PLAYBACK_URL: {
    message: 'Signed video playback URL fetched successfully.',
    statusCode: HttpStatus.OK,
  },
};
