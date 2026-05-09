import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const contentItemSchema = z.object({
  type: z.enum(["video", "pdf", "notes", "resource"]),
  title: z.string().min(1),
  url: z.string().url().optional(),
  text: z.string().optional(),
});

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
  }),
});

export const createModuleSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    title: z.string().min(2),
    order: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
    videoUrl: z.string().url().optional(),
    resources: z.array(z.string().url()).optional(),
    contents: z.array(contentItemSchema).optional(),
  }),
});

export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    courseId: objectId,
    moduleId: objectId.optional(),
    questions: z.array(
      z.object({
        question: z.string().min(1),
        type: z.enum(["mcq", "short_answer"]),
        options: z.array(z.string().min(1)).optional(),
        correctAnswer: z.string().min(1),
        marks: z.number().positive().optional(),
      }),
    ).min(1),
  }),
});

export const enrollCourseSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const submitQuizSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    answers: z.array(
      z.object({
        questionId: objectId,
        studentAnswer: z.string().min(1),
      }),
    ).min(1),
  }),
});

export const gradeStudentSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    courseId: objectId,
    quizId: objectId,
    score: z.number().min(0),
    feedback: z.string().optional(),
  }),
});

export const addModuleContentSchema = z.object({
  params: z.object({
    id: objectId,
    moduleId: objectId,
  }),
  body: z.object({
    type: z.enum(["video", "pdf", "notes", "resource"]).optional(),
    title: z.string().min(1).optional(),
    url: z.string().url().optional(),
    text: z.string().optional(),
  }),
});

export const courseIdParamsSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const gradeAttemptSchema = z.object({
  params: z.object({
    attemptId: objectId,
  }),
  body: z.object({
    feedback: z.string().optional(),
    submissions: z.array(z.object({
      submissionId: objectId,
      marksAwarded: z.number().min(0),
      isCorrect: z.boolean().optional(),
      tutorFeedback: z.string().optional(),
    })).min(1),
  }),
});

