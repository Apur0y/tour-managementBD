import { BookingModel } from './booking.model';
import { TourModel } from '../tour/tour.model';
import { AppError } from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes';
import { ICreateBookingPayload, BookingStatus, PaymentStatus } from './booking.interface';
import { StripeService } from '../payment/stripe.service';
import mongoose from 'mongoose';

const createBooking = async (userId: string, payload: ICreateBookingPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tourId, numberOfPeople, customerDetails } = payload;

    // Validate tour exists and is active
    const tour = await TourModel.findById(tourId);
    if (!tour) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tour not found');
    }

    if (!tour.isActive) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Tour is not available for booking');
    }

    // Check if tour has started
    const currentDate = new Date();
    if (tour.startDate <= currentDate) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Cannot book tours that have already started');
    }

    // Calculate total amount
    const totalAmount = tour.costFrom * numberOfPeople;

    // Create booking
    const booking = await BookingModel.create([{
      user: userId,
      tour: tourId,
      numberOfPeople,
      totalAmount,
      paymentStatus: PaymentStatus.PENDING,
      bookingStatus: BookingStatus.PENDING,
      customerDetails
    }], { session });

    await session.commitTransaction();
    
    // Populate tour and user data
    const populatedBooking = await BookingModel.findById(booking[0]._id)
      .populate('tour', 'title location costFrom startDate endDate images')
      .populate('user', 'name email');

    return populatedBooking;
  } catch (error: any) {
    await session.abortTransaction();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to create booking: ${error.message}`);
  } finally {
    session.endSession();
  }
};

const getUserBookings = async (
  userId: string, 
  status?: BookingStatus,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const query: any = { user: userId };
    if (status) {
      query.bookingStatus = status;
    }

    const skip = (page - 1) * limit;
    
    const bookings = await BookingModel.find(query)
      .populate('tour', 'title location costFrom startDate endDate images slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BookingModel.countDocuments(query);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to retrieve bookings: ${error.message}`);
  }
};

const getBookingById = async (bookingId: string, userId?: string) => {
  try {
    const query: any = { _id: bookingId };
    if (userId) {
      query.user = userId;
    }

    const booking = await BookingModel.findOne(query)
      .populate('tour', 'title location costFrom startDate endDate images slug guide')
      .populate('user', 'name email phone');

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    return booking;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to retrieve booking: ${error.message}`);
  }
};

const cancelBooking = async (bookingId: string, userId: string, reason?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find booking
    const booking = await BookingModel.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if booking can be cancelled
    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Booking is already cancelled');
    }

    if (booking.bookingStatus === BookingStatus.COMPLETED) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Cannot cancel completed booking');
    }

    // Check cancellation policy (e.g., 24 hours before tour start)
    const tour = await TourModel.findById(booking.tour);
    if (tour) {
      const hoursUntilTour = (tour.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      if (hoursUntilTour < 24) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Cannot cancel booking less than 24 hours before tour start');
      }
    }

    // Update booking status
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: BookingStatus.CANCELLED,
        cancellationReason: reason
      },
      { new: true, session }
    );

    // If payment was made, initiate refund
    if (booking.paymentStatus === PaymentStatus.PAID && booking.stripePaymentIntentId) {
      await StripeService.refundPayment(booking.stripePaymentIntentId, undefined, reason);
    }

    await session.commitTransaction();
    return updatedBooking;
  } catch (error: any) {
    await session.abortTransaction();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to cancel booking: ${error.message}`);
  } finally {
    session.endSession();
  }
};

const createPaymentIntent = async (bookingId: string, userId: string) => {
  try {
    // Verify booking belongs to user
    const booking = await BookingModel.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if payment is needed
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Booking is already paid');
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Cannot process payment for cancelled booking');
    }

    // Create payment intent
    const result = await StripeService.createPaymentIntent(
      booking.totalAmount,
      'usd',
      bookingId,
      {
        numberOfPeople: booking.numberOfPeople,
        customerEmail: booking.customerDetails.email
      }
    );

    return result;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to create payment intent: ${error.message}`);
  }
};

const confirmPayment = async (paymentIntentId: string) => {
  try {
    const result = await StripeService.confirmPayment(paymentIntentId);
    return result;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to confirm payment: ${error.message}`);
  }
};

// Admin/Guide functions
const getTourBookings = async (
  tourId: string, 
  guideId?: string,
  status?: BookingStatus,
  page: number = 1,
  limit: number = 10
) => {
  try {
    // Verify tour belongs to guide if guideId provided
    if (guideId) {
      const tour = await TourModel.findOne({ _id: tourId, guide: guideId });
      if (!tour) {
        throw new AppError(httpStatus.FORBIDDEN, 'Access denied to this tour');
      }
    }

    const query: any = { tour: tourId };
    if (status) {
      query.bookingStatus = status;
    }

    const skip = (page - 1) * limit;
    
    const bookings = await BookingModel.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BookingModel.countDocuments(query);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to retrieve tour bookings: ${error.message}`);
  }
};

const updateBookingStatus = async (
  bookingId: string, 
  newStatus: BookingStatus, 
  guideId?: string
) => {
  try {
    // Find booking and verify guide has access
    const booking = await BookingModel.findById(bookingId).populate('tour');
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    if (guideId && booking.tour.guide?.toString() !== guideId) {
      throw new AppError(httpStatus.FORBIDDEN, 'Access denied to this booking');
    }

    // Update booking status
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { bookingStatus: newStatus },
      { new: true }
    ).populate('user', 'name email phone');

    return updatedBooking;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to update booking status: ${error.message}`);
  }
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  createPaymentIntent,
  confirmPayment,
  getTourBookings,
  updateBookingStatus
};
