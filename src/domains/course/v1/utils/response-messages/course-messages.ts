import { HttpStatus } from '@/shared/constants/http-status';

export const COURSE_MESSAGES = {
  COURSE_CREATED: {
    message: 'Course has been successfully created',
    statusCode: HttpStatus.CREATED,
  },
  COURSE_UPDATED: {
    message: 'Course updated successfully',
    statusCode: HttpStatus.OK,
  },
  COURSE_FETCHED: {
    message: 'Course fetched successfully',
    statusCode: HttpStatus.OK,
  },
  COURSES_BY_INSTRUCTOR: {
    message: 'Courses by Instructor fetched successfully',
    statusCode: HttpStatus.OK,
  },
  COURSE_DELETED: {
    message: 'Course has been deleted successfully',
    statusCode: HttpStatus.NO_CONTENT,
  },
  COURSES_FETCHED: {
    message: 'Courses have been fetched successfully',
    statusCode: HttpStatus.OK,
  },
  ENROLLED_COURSES_FETCHED: {
    message: 'Fetched all enrolled courses',
    statusCode: HttpStatus.OK,
  },
  SECTION_FETCHED: {
    message: 'Fetched module successfully',
    statusCode: HttpStatus.OK,
  },
  SECTION_CREATED: {
    message: 'Module created successfully',
    statusCode: HttpStatus.CREATED,
  },
  SECTION_DELETED: {
    message: 'Module has been deleted successfully',
    statusCode: HttpStatus.NO_CONTENT,
  },
  SECTION_UPDATED: {
    message: 'Module has updated successfully',
    statusCode: HttpStatus.OK,
  },
  SECTIONS_FETCHED: {
    message: 'Fetched modules successfully',
    statusCode: HttpStatus.OK,
  },
  LESSON_FETCHED: {
    message: 'Fetched lesson successfully',
    statusCode: HttpStatus.OK,
  },
  LESSON_CREATED: {
    message: 'Created lesson successfully',
    statusCode: HttpStatus.OK,
  },
  LESSON_DELETED: {
    message: 'Lesson has been deleted successfully',
    statusCode: HttpStatus.NO_CONTENT,
  },
  LESSON_UPDATED: {
    message: 'Lesson has been updated successfully',
    statusCode: HttpStatus.OK,
  },
  LESSONS_FETCHED: {
    message: 'Fetched lessons successfully',
    statusCode: HttpStatus.OK,
  },
  QUIZZES_FETCHED: {
    message: 'Fetched quizzes successfully',
    statusCode: HttpStatus.OK,
  },
  QUIZ_FETCHED: {
    message: 'Fetched quiz successfully',
    statusCode: HttpStatus.OK,
  },
  QUIZ_CREATED: {
    message: 'Quiz created successfully',
    statusCode: HttpStatus.CREATED,
  },
  QUIZ_DELETED: {
    message: 'Quiz has been deleted successfully',
    statusCode: HttpStatus.NO_CONTENT,
  },
  QUIZ_UPDATED: {
    message: 'Quiz has been updated successfully',
    statusCode: HttpStatus.OK,
  },
  QUIZZES_BY_COURSE: {
    message: 'Quizzes fetched by course successfully',
    statusCode: HttpStatus.OK,
  },
  QUIZ_BLOCKED: {
    message: 'Quiz has been blocked successfully',
    statusCode: HttpStatus.OK,
  },
};
