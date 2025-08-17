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

export const userValidation = {
  createUserZodSchema,
  loginUserZodSchema,
};
