import { CreateQuizRequest } from '@/domains/service-clients/course/proto/generated/course/types/quiz';
import { z, ZodType } from 'zod';

// Enum for question types used in the quiz
export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  SHORT_ANSWER = 'short-answer',
}

const QuestionTypeZ = z.nativeEnum(QuestionTypeEnum);

// Option schema for quiz questions
const optionSchema = z.object({
  value: z.string().min(1).max(1024),
  isCorrect: z.boolean(),
});

// Question schema
export const questionSchema = z
  .object({
    question: z
      .string()
      .min(5, 'Question must be at least 5 characters')
      .max(4096),
    type: QuestionTypeZ,
    required: z.boolean().optional().default(false),
    timeLimit: z.number().int().min(0).max(3600).optional(),
    points: z.number().int().min(1).max(100),
    options: z
      .array(optionSchema)
      .min(2, { message: 'At least two options required' })
      .max(20, { message: 'Maximum 20 options allowed' })
      .optional(),
    correctAnswer: z.string().min(1).optional(),
    explanation: z.string().max(2048).optional(),
  })
  .superRefine((question, ctx) => {
    // Only for MULTIPLE_CHOICE type: options check for min count and one correct
    if (question.type === QuestionTypeEnum.MULTIPLE_CHOICE) {
      const opts = question.options;
      if (!opts || opts.length < 2) {
        ctx.addIssue({
          path: ['options'],
          code: z.ZodIssueCode.custom,
          message:
            'Options are required and must have at least two items for MULTIPLE_CHOICE questions',
        });
      }
      if (
        opts &&
        Array.isArray(opts) &&
        !opts.some((o: any) => o.isCorrect === true)
      ) {
        ctx.addIssue({
          path: ['options'],
          code: z.ZodIssueCode.custom,
          message:
            'At least one option must be marked as correct for MULTIPLE_CHOICE questions',
        });
      }
    }
  });

// Quiz creation schema
export const createQuizSchema: ZodType<CreateQuizRequest> = z.object({
  courseId: z.string().uuid({ message: 'Invalid courseId format' }),
  sectionId: z.string().uuid({ message: 'Invalid sectionId format' }),
  userId: z.string().uuid({ message: 'Invalid userId format' }),
  maxAttempts: z.number().int().min(1).max(100),
  passingScore: z.number().int().min(1).max(100),
  isRequired: z.boolean().default(false),
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  timeLimit: z.number().int().min(1).max(10800).optional(),
  description: z.string().max(2000).optional(),
  questions: z
    .array(questionSchema)
    .min(1, { message: 'At least one question is required' })
    .max(100, { message: 'No more than 100 questions' }),
}) as unknown as ZodType<CreateQuizRequest>;

export type CreateQuizDto = z.infer<typeof createQuizSchema>;
