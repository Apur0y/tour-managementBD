import z from "zod";
import { BookingStatus } from "./booking.interface";

const createBookingZodSchema = z.object({
  body: z.object({
    tourId: z.string({ required_error: "Tour ID is required" }),
    numberOfPeople: z.number({ required_error: "Number of people is required" })
      .int("Number of people must be an integer")
      .min(1, "Number of people must be at least 1"),
    customerDetails: z.object({
      name: z.string({ required_error: "Customer name is required" })
        .min(1, "Customer name cannot be empty"),
      email: z.string({ required_error: "Customer email is required" })
        .email("Invalid email format"),
      phone: z.string({ required_error: "Customer phone is required" })
        .min(1, "Customer phone cannot be empty"),
      specialRequests: z.string().optional()
    })
  })
});

const createPaymentIntentZodSchema = z.object({
  body: z.object({
    bookingId: z.string({ required_error: "Booking ID is required" })
  })
});

const confirmPaymentZodSchema = z.object({
  body: z.object({
    paymentIntentId: z.string({ required_error: "Payment Intent ID is required" })
  })
});

const cancelBookingZodSchema = z.object({
  body: z.object({
    reason: z.string().optional()
  })
});

const updateBookingStatusZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus, { 
      required_error: "Booking status is required" 
    })
  })
});

const getBookingsQueryZodSchema = z.object({
  query: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
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

export const bookingValidation = {
  createBookingZodSchema,
  createPaymentIntentZodSchema,
  confirmPaymentZodSchema,
  cancelBookingZodSchema,
  updateBookingStatusZodSchema,
  getBookingsQueryZodSchema
};
