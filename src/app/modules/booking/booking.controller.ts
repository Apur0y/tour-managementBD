import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { BookingService } from "./booking.service";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../errorHelpers/AppError";
import { StripeService } from "../payment/stripe.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const booking = await BookingService.createBooking(userId, req.body);
  
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Booking created successfully!",
    data: booking,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const { status } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await BookingService.getUserBookings(
    userId, 
    status as any, 
    page, 
    limit
  );
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Bookings retrieved successfully!",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { id } = req.params;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const booking = await BookingService.getBookingById(id, userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Booking retrieved successfully!",
    data: booking,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const booking = await BookingService.cancelBooking(id, userId, reason);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Booking cancelled successfully!",
    data: booking,
  });
});

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { bookingId } = req.body;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const result = await BookingService.createPaymentIntent(bookingId, userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Payment intent created successfully!",
    data: {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntent.id,
      amount: result.payment.amount,
      currency: result.payment.currency
    },
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.body;
  
  const result = await BookingService.confirmPayment(paymentIntentId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Payment confirmed successfully!",
    data: result,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const payload = req.body;

  if (!signature) {
    throw new AppError(httpStatus.BAD_REQUEST, "Missing Stripe signature");
  }

  const result = await StripeService.handleStripeWebhook(signature, payload);
  
  res.status(httpStatus.OK).json(result);
});

// Admin/Guide functions
const getTourBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { tourId } = req.params;
  const { status } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to view tour bookings
  const guideId = (userRole === 'GUIDE' || userRole === 'ADMIN') ? userId : undefined;
  
  const result = await BookingService.getTourBookings(
    tourId, 
    guideId,
    status as any, 
    page, 
    limit
  );
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tour bookings retrieved successfully!",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { bookingId } = req.params;
  const { status } = req.body;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to update booking status
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const guideId = userRole === 'GUIDE' ? userId : undefined;
  
  const booking = await BookingService.updateBookingStatus(bookingId, status, guideId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Booking status updated successfully!",
    data: booking,
  });
});

export const BookingControllers = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getTourBookings,
  updateBookingStatus
};
