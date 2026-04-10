import { EnrollmentData, EnrollmentDetail, QuizQuestion } from "@/domains/service-clients/course/proto/generated/course/types/enrollment";
import { DomainEnrollmentDetail, Enrollment, QuestionOption } from "../types";
import { EnrollmentProgressData, ProgressData } from "@/domains/service-clients/course/proto/generated/course/types/progress";
import { CertificateData } from "@/domains/service-clients/course/proto/generated/course/types/certificate";
import { ReviewData } from "@/domains/service-clients/course/proto/generated/course/types/review";

export class EnrollmentResponseMapper {
  // Mapping Functions
  public static toEnrollmentDetail = (
    enrollmentDetail: EnrollmentDetail
  ): DomainEnrollmentDetail => {
    return {
      courseId: enrollmentDetail.courseId,
      enrolledAt: enrollmentDetail.enrolledAt,
      enrollmentId: enrollmentDetail.enrollmentId,
      progressPercent: enrollmentDetail.progressPercent,
      userId: enrollmentDetail.userId,
      status: enrollmentDetail.status,
      modules: enrollmentDetail.modules.map(module => ({
        description: module.description,
        id: module.id,
        isPublished: module.isPublished,
        order: module.order,
        title: module.title,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          duration: lesson.duration,
          completed: lesson.completed,
          completedAt: lesson.completedAt,
          order: lesson.order,
          title: lesson.title,
        })),
        quiz: module.quiz
          ? {
            description: module.quiz.description,
            timeLimit: module.quiz.timeLimit,
            questions: module.quiz.questions.map<QuizQuestion>(question => ({
              id: question.id,
              options: question.options.map<QuestionOption>(option => ({
                value: option.value,
              })),
              question: question.question,
              requirePassingScore: question.requirePassingScore,
              type: question.type,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              score: question.score,
              timeLimit: question.timeLimit,
            })),
            completed: module.quiz.completed,
            completedAt: module.quiz.completedAt,
            id: module.quiz.id,
            passed: module.quiz.passed,
            passingScore: module.quiz.passingScore,
            requirePassingScore: module.quiz.requirePassingScore,
            score: module.quiz.score,
            title: module.quiz.title,
          }
          : undefined,
      })),
    };
  };
  public static toEnrollmentProgress = (
    enrollmentProgress: EnrollmentProgressData
  ): EnrollmentProgressData => {
    return {
      courseId: enrollmentProgress.courseId,
      completedUnits: enrollmentProgress.completedUnits,
      enrollmentId: enrollmentProgress.enrollmentId,
      overallProgress: enrollmentProgress.overallProgress,
      totalUnits: enrollmentProgress.totalUnits,
      userId: enrollmentProgress.userId,
      lessons: enrollmentProgress.lessons.map(lesson => ({
        completed: lesson.completed,
        lessonId: lesson.lessonId,
        completedAt: lesson.completedAt,
        duration: lesson.duration,
        progressPercent: lesson.progressPercent,
        watchTime: lesson.watchTime,
      })),
      quizzes: enrollmentProgress.quizzes.map(quiz => ({
        attempts: quiz.attempts,
        completed: quiz.completed,
        passed: quiz.passed,
        quizId: quiz.quizId,
        completedAt: quiz.completedAt,
        score: quiz.score,
      })),
    };
  };

  public static toEnrollmentData = (
    enrollmentData: EnrollmentData
  ): Enrollment => {
    return {
      id: enrollmentData.id,
      courseId: enrollmentData.courseId,
      completedAt: enrollmentData.completedAt,
      enrolledAt: enrollmentData.enrolledAt,
      createdAt: enrollmentData.createdAt,
      progress: enrollmentData.progress,
      status: enrollmentData.status,
      updatedAt: enrollmentData.updatedAt,
      userId: enrollmentData.userId,
      deletedAt: enrollmentData.deletedAt,
      course: enrollmentData.course
        ? {
          category: enrollmentData.course?.category,
          id: enrollmentData.course?.id,
          instructor: enrollmentData.course.instructor
            ? {
              id: enrollmentData.course?.instructor.id,
              name: enrollmentData.course?.instructor.name,
              avatar: enrollmentData.course?.instructor.avatar,
              email: enrollmentData.course?.instructor.email,
            }
            : undefined,
          lessonsCount: enrollmentData.course?.lessonsCount,
          level: enrollmentData.course?.level,
          rating: enrollmentData.course?.rating,
          thumbnail: enrollmentData.course?.thumbnail,
          title: enrollmentData.course?.title,
        }
        : undefined,
    };
  };

  public static toProgress = (dto: ProgressData): ProgressData => {
    return {
      id: dto.id,
      enrollmentId: dto.enrollmentId,
      lessonId: dto.lessonId,
      completed: dto.completed,
      completedAt: dto.completedAt ? dto.completedAt : '',
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : '',
    };
  };
  public static toCertificate = (
    dto: CertificateData
  ): CertificateData => {
    return {
      id: dto.id,
      certificateNumber: dto.certificateNumber,
      completedAt: dto.completedAt,
      courseId: dto.courseId,
      courseTitle: dto.courseTitle,
      createdAt: dto.createdAt,
      enrollmentId: dto.enrollmentId,
      issueDate: dto.issueDate,
      studentName: dto.studentName,
      updatedAt: dto.updatedAt,
      userId: dto.userId,
    };
  };

  public static toReview = (dto: ReviewData): ReviewData => {
    return {
      id: dto.id,
      userId: dto.userId,
      courseId: dto.courseId,
      enrollmentId: dto.enrollmentId,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      user: dto.user,
    };
  };
}
