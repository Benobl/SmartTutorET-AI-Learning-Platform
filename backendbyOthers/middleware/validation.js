const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }
    
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.min': 'Password must be at least 8 characters long'
    }),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  role: Joi.string().valid('student', 'tutor').required(),
  phone: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const courseSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  price: Joi.number().min(0).required(),
  duration: Joi.number().required()
});

const applicationSchema = Joi.object({
  course: Joi.string().required(),
  coverLetter: Joi.string().min(50).required(),
  experience: Joi.string().min(50).required(),
  qualifications: Joi.array().items(Joi.object({
    degree: Joi.string().required(),
    institution: Joi.string().required(),
    year: Joi.number().min(1950).max(new Date().getFullYear()).required(),
    fieldOfStudy: Joi.string().optional()
  })).min(1).required(),
  teachingPhilosophy: Joi.string().min(50).optional(),
  availabilityHours: Joi.string().optional(),
  linkedinProfile: Joi.string().uri().optional()
});

const paymentSchema = Joi.object({
  course: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('credit-card', 'paypal', 'bank-transfer').required()
});

const lessonSchema = Joi.object({
  course: Joi.string().required(),
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  week: Joi.number().min(1).required(),
  order: Joi.number().min(1).required(),
  videoUrl: Joi.string().uri().optional(),
  duration: Joi.number().optional()
});

const sessionSchema = Joi.object({
  course: Joi.string().required(),
  title: Joi.string().min(3).required(),
  description: Joi.string().optional(),
  type: Joi.string().valid('live', 'peer-to-peer', 'recorded'),
  scheduledAt: Joi.date().required(),
  duration: Joi.number().min(15).optional(),
  group: Joi.string().optional()
});

const groupSchema = Joi.object({
  course: Joi.string().required(),
  name: Joi.string().min(3).required(),
  description: Joi.string().optional(),
  maxMembers: Joi.number().min(2).max(50).optional()
});

const assessmentSchema = Joi.object({
  course: Joi.string().required(),
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string().valid('quiz', 'assignment', 'exam'),
  questions: Joi.array().min(1).items(Joi.object({
    questionText: Joi.string().required(),
    type: Joi.string().valid('multiple-choice', 'true-false', 'short-answer').required(),
    options: Joi.array().items(Joi.string()).optional(),
    correctAnswer: Joi.string().required(),
    points: Joi.number().min(1).optional()
  })).required(),
  timeLimit: Joi.number().min(5).optional(),
  dueDate: Joi.date().optional()
});

const studySquadSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().optional(),
  subject: Joi.string().required(),
  course: Joi.string().optional(),
  maxMembers: Joi.number().min(2).max(20).optional(),
  isPublic: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  meetingSchedule: Joi.string().optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  courseSchema,
  applicationSchema,
  paymentSchema,
  lessonSchema,
  sessionSchema,
  groupSchema,
  assessmentSchema,
  studySquadSchema
};
