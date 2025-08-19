import z from "zod";
import { Role, IsActive } from "./user.interface";

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    picture: z.string().url("Picture must be a valid URL").optional(),
    address: z.string().optional(),
    role: z.nativeEnum(Role).optional().default(Role.USER),
    isActive: z.nativeEnum(IsActive).optional().default(IsActive.ACTIVE),
  }),
});

const loginUserZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

// Profile update validation (for form data)
const updateProfileZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    // picture will be handled by multer, not validated here
  }),
});

// Password change validation
const changePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: "Current password is required" }),
    newPassword: z.string({ required_error: "New password is required" })
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string({ required_error: "Confirm password is required" }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  }),
});

export const userValidation = {
  createUserZodSchema,
  loginUserZodSchema,
  updateProfileZodSchema,
  changePasswordZodSchema,
};
