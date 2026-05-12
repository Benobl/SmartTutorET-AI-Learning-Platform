import { z } from "zod";

// Strict regex for emails: letters, numbers, and standard symbols only. No emojis/scripts.
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Strict regex for names: letters, spaces, and standard punctuation only. No emojis/scripts.
const nameRegex = /^[a-zA-Z\s.'-]+$/;
// Strict password regex: Uppercase, Lowercase, Number, Special Character, No spaces.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const signupSchema = z.object({
    body: z.object({
        name: z.string()
            .min(2, "Invalid name format")
            .max(50, "Name too long")
            .regex(nameRegex, "Names cannot contain special characters or emojis"),
        email: z.string()
            .email("Invalid email format")
            .regex(emailRegex, "Emails cannot contain special characters or emojis")
            .transform(val => val.toLowerCase().trim()),
        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .regex(passwordRegex, "Password must include uppercase, lowercase, number, and special character"),
        role: z.enum(["student", "tutor", "manager"]).optional(),
        grade: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string()
            .email("Invalid credentials")
            .transform(val => val.toLowerCase().trim()),
        password: z.string().min(1, "Invalid credentials"),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string()
            .email("Invalid request")
            .transform(val => val.toLowerCase().trim()),
    }),
});

export const resetPasswordSchema = z.object({
    params: z.object({
        token: z.string().min(1, "Invalid or expired token"),
    }),
    body: z.object({
        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .regex(passwordRegex, "Password must include uppercase, lowercase, number, and special character"),
    }),
});
