import z from "zod";

const addToWishlistZodSchema = z.object({
  body: z.object({
    tourId: z.string({ required_error: "Tour ID is required" })
      .min(1, "Tour ID cannot be empty")
  })
});

const removeFromWishlistZodSchema = z.object({
  params: z.object({
    tourId: z.string({ required_error: "Tour ID is required" })
      .min(1, "Tour ID cannot be empty")
  })
});

const getWishlistQueryZodSchema = z.object({
  query: z.object({
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

const checkWishlistZodSchema = z.object({
  params: z.object({
    tourId: z.string({ required_error: "Tour ID is required" })
      .min(1, "Tour ID cannot be empty")
  })
});

export const wishlistValidation = {
  addToWishlistZodSchema,
  removeFromWishlistZodSchema,
  getWishlistQueryZodSchema,
  checkWishlistZodSchema
};
