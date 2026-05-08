import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string("Password is required").min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string("Name is required").trim().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  mobile: z.string("Mobile number is required").trim().min(1, "Mobile number is required"),
  password: z.string("Password is required").min(6, "Password must be at least 6 characters"),
});

export const verifyOtpSchema = z.object({
  userId: z.number("userId is required"),
  code: z.string("OTP is required").length(6, "OTP must be 6 digits"),
});
