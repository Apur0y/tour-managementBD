import { Router } from "express";
import { BookingControllers } from "./booking.controller";
import validateRequest from "../../middlewares/validateRequest";
import { bookingValidation } from "./booking.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../user/user.interface";

const router = Router();

// User booking routes
router.post(
  "/",
  auth(), // Any authenticated user can create booking
  validateRequest(bookingValidation.createBookingZodSchema),
  BookingControllers.createBooking
);

router.get(
  "/my-bookings",
  auth(), // Any authenticated user can view their bookings
  validateRequest(bookingValidation.getBookingsQueryZodSchema),
  BookingControllers.getUserBookings
);

router.get(
  "/:id",
  auth(), // Any authenticated user can view their booking details
  BookingControllers.getBookingById
);

router.put(
  "/:id/cancel",
  auth(), // Any authenticated user can cancel their booking
  validateRequest(bookingValidation.cancelBookingZodSchema),
  BookingControllers.cancelBooking
);

// Payment routes
router.post(
  "/payment/create-intent",
  auth(), // Any authenticated user can create payment intent
  validateRequest(bookingValidation.createPaymentIntentZodSchema),
  BookingControllers.createPaymentIntent
);

router.post(
  "/payment/confirm",
  auth(), // Any authenticated user can confirm payment
  validateRequest(bookingValidation.confirmPaymentZodSchema),
  BookingControllers.confirmPayment
);

// Stripe webhook (no authentication required)
router.post(
  "/payment/webhook",
  BookingControllers.handleStripeWebhook
);

// Guide/Admin routes
router.get(
  "/tour/:tourId/bookings",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  validateRequest(bookingValidation.getBookingsQueryZodSchema),
  BookingControllers.getTourBookings
);

router.put(
  "/:bookingId/status",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  validateRequest(bookingValidation.updateBookingStatusZodSchema),
  BookingControllers.updateBookingStatus
);

export const BookingRoutes = router;
