

export interface DomainEnrollmentDetail {
  enrollmentId: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  status: string;
  enrolledAt: string;
  modules: EnrollmentModule[];
}

export interface EnrollmentModule {
  id: string;
  title: string;
  description?: string | undefined;
  order: number;
  isPublished: boolean;
  lessons: LessonProgress[];
  quiz?: QuizProgress | undefined;
}

export interface LessonProgress {
  id: string;
  title: string;
  order: number;
  /** second ?s = 1 */
  duration?: number | undefined;
  completed: boolean;
  completedAt?: string | undefined;
}

export interface QuestionOption {
  value: string;
}

export interface QuizQuestion {
  id: string;
  requirePassingScore: boolean;
  options: QuestionOption[];
  timeLimit?: number | undefined;
  question: string;
  type: string;
  explanation?: string | undefined;
  score?: number | undefined;
  correctAnswer?: string | undefined;
}

export interface QuizProgress {
  id: string;
  title: string;
  description?: string | undefined;
  questions: QuizQuestion[];
  timeLimit?: number | undefined;
  requirePassingScore: boolean;
  passingScore?: number | undefined;
  completed: boolean;
  passed?: boolean | undefined;
  score?: number | undefined;
  completedAt?: string | undefined;
}



export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  enrolledAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  course: EnrollmentCourse | undefined;
  deletedAt?: string | undefined;
}

export interface EnrollmentCourse {
  id: string;
  title: string;
  rating: number;
  thumbnail: string;
  category: string;
  level: string;
  lessonsCount: number;
  instructor: CourseInstructor | undefined;
}

export interface CourseInstructor {
  id: string;
  name: string;
  avatar?: string | undefined;
  email?: string | undefined;
}


export interface EnrollmentProgressResponse {
  enrollmentId: string;
  courseId: string;
  userId: string;

  overallProgress: number;
  completedUnits: number;
  totalUnits: number;

  lessons: Array<{
    lessonId: string;
    completed: boolean;
    completedAt?: string;
    watchTime?: number;
    duration?: number;
  }>;

  quizzes: Array<{
    quizId: string;
    completed: boolean;
    score?: number;
    attempts: number;
    passed: boolean;
    completedAt?: string;
  }>;

  milestones: Array<{
    id: string;
    type:
      | 'LESSON_COMPLETED'
      | 'QUIZ_PASSED'
      | 'QUIZ_PERFECT'
      | 'COURSE_COMPLETED';
    achievedAt: string;
    metadata?: Record<string, any>;
  }>;
}

export interface UpdateLessonProgressRequest {
  currentTime: number; // raw, not percentage
  duration: number;
  event: 'timeupdate' | 'completed';
}

export interface UpdateLessonProgressResponse {
  completed: boolean;
  progressPercent: number;
  milestone?: {
    id: string;
    type: 'LESSON_COMPLETED';
    achievedAt: string;
  };
}

export interface SubmitQuizAttemptRequest {
  answers: any[]; // depends on quiz model
  timeSpent: number;
}

export interface SubmitQuizAttemptResponse {
  score: number;
  passed: boolean;
  completed: boolean;
  attempts: number;
  milestone?: {
    id: string;
    type: 'QUIZ_PASSED' | 'QUIZ_PERFECT';
    achievedAt: string;
  };
}
