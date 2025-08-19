import z from "zod";
import { Included, Excluded } from "./tour.interface";

const createTourZodSchema = z.object({
  body: z.object({
    slug: z.string({ required_error: "Slug is required" })
      .min(1, "Slug cannot be empty"),
    title: z.string({ required_error: "Title is required" })
      .min(1, "Title cannot be empty"),
    description: z.string({ required_error: "Description is required" })
      .min(10, "Description must be at least 10 characters"),
    images: z.array(z.string().url("Invalid image URL")).optional().default([]),
    location: z.string({ required_error: "Location is required" })
      .min(1, "Location cannot be empty"),
    costFrom: z.number({ required_error: "Cost is required" })
      .min(0, "Cost cannot be negative"),
    startDate: z.string({ required_error: "Start date is required" })
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date format"),
    endDate: z.string({ required_error: "End date is required" })
      .refine((val) => !isNaN(Date.parse(val)), "Invalid end date format"),
    tourType: z.string({ required_error: "Tour type is required" }),
    included: z.array(z.nativeEnum(Included)).optional().default([]),
    excluded: z.array(z.nativeEnum(Excluded)).optional().default([]),
    amenities: z.array(z.string()).optional().default([]),
    tourPlan: z.array(z.string()).optional().default([]),
    tourTags: z.array(z.string()).optional().default([]),
    duartion: z.string().optional(),
    maxPeople: z.string().optional(),
    category: z.array(z.string()).optional().default([])
  }).refine((data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  }, {
    message: "End date must be after start date",
    path: ["endDate"]
  })
});

const updateTourZodSchema = z.object({
  body: z.object({
    slug: z.string().min(1, "Slug cannot be empty").optional(),
    title: z.string().min(1, "Title cannot be empty").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    images: z.array(z.string().url("Invalid image URL")).optional(),
    location: z.string().min(1, "Location cannot be empty").optional(),
    costFrom: z.number().min(0, "Cost cannot be negative").optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date format").optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date format").optional(),
    tourType: z.string().optional(),
    included: z.array(z.nativeEnum(Included)).optional(),
    excluded: z.array(z.nativeEnum(Excluded)).optional(),
    amenities: z.array(z.string()).optional(),
    tourPlan: z.array(z.string()).optional(),
    tourTags: z.array(z.string()).optional(),
    duartion: z.string().optional(),
    maxPeople: z.string().optional(),
    category: z.array(z.string()).optional()
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate > startDate;
    }
    return true;
  }, {
    message: "End date must be after start date",
    path: ["endDate"]
  })
});

const getTourParamsZodSchema = z.object({
  params: z.object({
    tourId: z.string({ required_error: "Tour ID is required" })
      .min(1, "Tour ID cannot be empty")
  })
});

const getToursQueryZodSchema = z.object({
  query: z.object({
    isActive: z.string().optional().refine((val) => {
      if (val === undefined) return true;
      return val === "true" || val === "false";
    }, "isActive must be 'true' or 'false'"),
    page: z.string().optional().refine((val) => {
      if (val === undefined) return true;
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, "Page must be a positive number"),
    limit: z.string().optional().refine((val) => {
      if (val === undefined) return true;
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num <= 100;
    }, "Limit must be a positive number and not exceed 100")
  })
});

export const postedTourValidation = {
  createTourZodSchema,
  updateTourZodSchema,
  getTourParamsZodSchema,
  getToursQueryZodSchema
};
