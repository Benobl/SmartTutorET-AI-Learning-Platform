import { z } from "zod";

export const signupSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.enum(["student", "tutor", "manager"]).optional(),
        grade: z.string().optional(),
        phone: z.string().optional(),
        degree: z.string().optional(),
        experience: z.union([z.number(), z.string()]).optional(),
        subject: z.string().optional(),
        subjects: z.array(z.string()).optional(),
        skills: z.string().optional(),
        availability: z.array(z.string()).optional(),
        documents: z.object({
            cv: z.string().optional(),
            degree: z.string().optional(),
            certifications: z.string().optional(),
        }).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
    }),
});

export const resetPasswordSchema = z.object({
    params: z.object({
        token: z.string().min(1, "Reset token is required"),
    }),
    body: z.object({
        password: z.string().min(8, "New password must be at least 8 characters"),
    }),
});
