import { CourseData, CourseMetadata } from "@/domains/service-clients/course/proto/generated/course/types/course";
import { Course, CourseInfo, Lesson, Quiz, Section } from "../types";
import { QuizData } from "@/domains/service-clients/course/proto/generated/course/types/quiz";
import { ContentMetaData, LessonData } from "@/domains/service-clients/course/proto/generated/course/types/lesson";
import { ReviewData } from "@/domains/service-clients/course/proto/generated/course/types/review";
import { SectionData } from "@/domains/service-clients/course/proto/generated/course/types/section";

export class CourseResponseMapper {
  public static toCourse = (dto: CourseData): Course => {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      learningOutcomes: dto.learningOutcomes,
      requirements: dto.learningOutcomes,
      topics: dto.topics,
      students: dto.students,
      rating: dto.rating,
      totalRatings: dto.numberOfRating,
      slug: dto.slug,
      category: dto.category,
      status: dto.status,
      subCategory: dto.subCategory,
      durationUnit: dto.durationUnit,
      durationValue: dto.durationValue,
      subTitle: dto.subTitle,
      currency: dto.currency,
      discountPrice: dto.discountPrice,
      price: dto.price,
      language: dto.language,
      subtitleLanguage: dto.subtitleLanguage,
      targetAudience: dto.targetAudience,
      thumbnail: dto.thumbnail,
      trailer: dto.trailer,
      level: dto.level,
      instructor: {
        avatar: dto.instructor?.avatar,
        id: dto.instructor!.id,
        name: dto.instructor!.name,
        email: dto.instructor!.email,
      },
      instructorId: dto.instructorId,
      sections: dto.sections.map(CourseResponseMapper.toSection),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : undefined,
    };
  };
  public static toCourseMeta = (dto: CourseMetadata): CourseMetadata => {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      learningOutcomes: dto.learningOutcomes,
      requirements: dto.learningOutcomes,
      topics: dto.topics,
      students: dto.students,
      rating: dto.rating,
      numberOfRating: dto.numberOfRating,
      slug: dto.slug,
      category: dto.category,
      status: dto.status,
      subCategory: dto.subCategory,
      durationUnit: dto.durationUnit,
      durationValue: dto.durationValue,
      subTitle: dto.subTitle,
      currency: dto.currency,
      discountPrice: dto.discountPrice,
      price: dto.price,
      language: dto.language,
      subtitleLanguage: dto.subtitleLanguage,
      targetAudience: dto.targetAudience,
      thumbnail: dto.thumbnail,
      trailer: dto.trailer,
      level: dto.level,
      instructor: {
        avatar: dto.instructor?.avatar,
        id: dto.instructor!.id,
        name: dto.instructor!.name,
        email: dto.instructor!.email,
      },
      instructorId: dto.instructorId,
      noOfLessons: dto.noOfLessons,
      noOfQuizzes: dto.noOfQuizzes,
      noOfSections: dto.noOfSections,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : undefined,
    };
  };

  public static toSection = (dto: SectionData): Section => {
    return {
      id: dto.id,
      courseId: dto.courseId,
      title: dto.title,
      description: dto.description,
      isPublished: dto.isPublished,
      order: dto.order,
      quiz: CourseResponseMapper.toQuiz(dto.quiz),
      lessons: dto.lessons.map(CourseResponseMapper.toLesson),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : undefined,
    };
  };

  public static toReview = (dto: ReviewData): ReviewData => {
    return {
      id: dto.id,
      courseId: dto.courseId,
      comment: dto.comment,
      enrollmentId: dto.enrollmentId,
      createdAt: dto.createdAt,
      rating: dto.rating,
      updatedAt: dto.updatedAt,
      userId: dto.userId,
      user: dto.user,
    };
  };

  public static toLesson = (dto: LessonData): Lesson => {
    return {
      id: dto.id,
      sectionId: dto.sectionId,
      title: dto.title,
      contentUrl: dto.contentUrl,
      description: dto.description,
      estimatedDuration: dto.estimatedDuration,
      isPreview: dto.isPreview,
      isPublished: dto.isPublished,
      order: dto.order,
      metadata: Object.fromEntries(
        Object.entries(dto.metadata!).filter(
          ([key, value]) => !key.toString().startsWith('_')
        )
      ) as unknown as ContentMetaData,
      contentType: dto.contentType,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : undefined,
    };
  };

  public static toQuiz = (dto?: QuizData): Quiz | undefined => {
    if (!dto) return;
    return {
      id: dto.id,
      courseId: dto.courseId,
      sectionId: dto.sectionId,
      title: dto.title,
      description: dto.description,
      timeLimit: dto.timeLimit,
      passingScore: dto.passingScore,
      questions:
        dto.questions?.map(q => ({
          id: q.id,
          question: q.question,
          required: q.required,
          type: q.type,
          timeLimit: q.timeLimit,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer?.toString(),
          explanation: q.explanation ?? '',
        })) ?? [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : '',
    };
  };

  public static toCourseInfo = (course: CourseMetadata): CourseInfo => {
    return {
      thumbnail: course.thumbnail!,
      id: course.id,
      slug: course.slug,
      title: course.title,
      rating: course.rating,
      status: course.status,
      totalRatings: course.numberOfRating,
      students: course.students,
      durationValue: course.durationValue,
      durationUnit: course.durationUnit,
      price: course.price!,
      level: course.level,
      discountPrice: course.discountPrice,
      instructor: {
        id: course.instructor!.id,
        avatar: course.instructor?.avatar,
        name: course.instructor!.name,
        email: course.instructor?.email,
      },
    };
  }
}
