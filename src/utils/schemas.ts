// src/utils/schemas.ts
import { z } from "zod";
import { BUSINESS_REGEX, NAME_REGEX, EMAIL_REGEX, PHONE_REGEX, PWD_REGEX } from "./validation";

// Login schema
export const loginSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, "Enter a valid email address"),
  password: z.string().min(7, "Password must be at least 7 characters"),
});

// Register schema
export const registerSchema = z.object({
  country: z.string().min(1, "Country is required"),
  businessName: z.string().regex(BUSINESS_REGEX, "3–50 chars; letters, numbers, spaces, - and ' only"),
  contactEmail: z.string().regex(EMAIL_REGEX, "Enter a valid email"),
  contactPhoneNumber: z.string().regex(PHONE_REGEX, "10–15 digits (spaces or dashes allowed)"),
  contactFirstName: z.string().regex(NAME_REGEX, "2–24 letters, no spaces"),
  contactLastName: z.string().regex(NAME_REGEX, "2–24 letters, no spaces"),
  industryCategoryId: z.coerce.number().min(1, "Select a category"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, "Enter a valid email address"),
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: z.string().regex(PWD_REGEX, "Weak password"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
