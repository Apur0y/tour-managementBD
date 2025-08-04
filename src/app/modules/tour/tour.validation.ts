import { Types } from "mongoose";
import z from "zod";
// import { Excluded, Included } from "./tour.interface";

const createTourZodSchema = z.object({
  body: z.object({
    slug: z.string({ required_error: "Slug is required" }),
    title: z.string({ required_error: "Title is required" }),
    description: z.string({ required_error: "Description is required" }),
    images: z.array(z.string().url("Each image must be a valid URL")),
    location: z.string({ required_error: "Location is required" }),
    costFrom: z.number().nonnegative("Cost must be a positive number"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    tourType: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), {
        message: "tourType must be a valid ObjectId",
      }),
    // included: z.array(Included),
    // excluded: z.array(Excluded),
    amenities: z.array(z.string()).optional().default([]),
    tourPlan: z.array(z.string()).optional().default([]),
  }),
});


  export const tourValidation= {createTourZodSchema}