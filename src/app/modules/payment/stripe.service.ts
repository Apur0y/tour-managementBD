import Stripe from 'stripe';
import { AppError } from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes';
import { PaymentModel } from './payment.model';
import { BookingModel } from '../booking/booking.model';
import { PaymentMethod, PaymentType, TransactionStatus } from './payment.interface';
import { PaymentStatus, BookingStatus } from '../booking/booking.interface';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const createPaymentIntent = async (
  amount: number, 
  currency: string = 'usd',
  bookingId: string,
  metadata?: Record<string, any>
) => {
  try {
    // Validate booking exists
    const booking = await BookingModel.findById(bookingId).populate('user tour');
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId,
        userId: booking.user.toString(),
        tourId: booking.tour.toString(),
        ...metadata
      }
    });

    // Save payment record
    const payment = await PaymentModel.create({
      booking: bookingId,
      user: booking.user,
      amount,
      currency: currency.toUpperCase(),
      paymentMethod: PaymentMethod.CARD,
      paymentType: PaymentType.BOOKING,
      status: TransactionStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      metadata: {
        ...metadata,
        clientSecret: paymentIntent.client_secret
      }
    });

    // Update booking with payment intent ID
    await BookingModel.findByIdAndUpdate(bookingId, {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: PaymentStatus.PENDING
    });

    return {
      paymentIntent,
      payment,
      clientSecret: paymentIntent.client_secret
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Payment intent creation failed: ${error.message}`);
  }
};

const confirmPayment = async (paymentIntentId: string) => {
  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment intent not found');
    }

    // Find payment record
    const payment = await PaymentModel.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found');
    }

    // Update payment status based on Stripe status
    let paymentStatus: TransactionStatus;
    let bookingPaymentStatus: PaymentStatus;
    let bookingStatus: BookingStatus;

    switch (paymentIntent.status) {
      case 'succeeded':
        paymentStatus = TransactionStatus.SUCCEEDED;
        bookingPaymentStatus = PaymentStatus.PAID;
        bookingStatus = BookingStatus.CONFIRMED;
        break;
      case 'canceled':
        paymentStatus = TransactionStatus.CANCELED;
        bookingPaymentStatus = PaymentStatus.FAILED;
        bookingStatus = BookingStatus.CANCELLED;
        break;
      case 'payment_failed':
        paymentStatus = TransactionStatus.FAILED;
        bookingPaymentStatus = PaymentStatus.FAILED;
        bookingStatus = BookingStatus.CANCELLED;
        break;
      default:
        paymentStatus = TransactionStatus.PENDING;
        bookingPaymentStatus = PaymentStatus.PENDING;
        bookingStatus = BookingStatus.PENDING;
    }

    // Update payment record
    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      payment._id,
      {
        status: paymentStatus,
        stripeChargeId: paymentIntent.charges?.data[0]?.id,
        transactionId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message
      },
      { new: true }
    );

    // Update booking status
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      payment.booking,
      {
        paymentStatus: bookingPaymentStatus,
        bookingStatus: bookingStatus,
        paymentMethod: paymentIntent.charges?.data[0]?.payment_method_details?.type
      },
      { new: true }
    );

    return {
      payment: updatedPayment,
      booking: updatedBooking,
      paymentIntent
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Payment confirmation failed: ${error.message}`);
  }
};

const refundPayment = async (paymentIntentId: string, amount?: number, reason?: string) => {
  try {
    // Find payment record
    const payment = await PaymentModel.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found');
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent.charges?.data[0]?.id) {
      throw new AppError(httpStatus.BAD_REQUEST, 'No charge found for this payment');
    }

    // Create refund
    const refund = await stripe.refunds.create({
      charge: paymentIntent.charges.data[0].id,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if partial refund
      reason: reason as any || 'requested_by_customer'
    });

    // Create refund payment record
    const refundPayment = await PaymentModel.create({
      booking: payment.booking,
      user: payment.user,
      amount: refund.amount / 100, // Convert back to dollars
      currency: refund.currency.toUpperCase(),
      paymentMethod: payment.paymentMethod,
      paymentType: amount ? PaymentType.PARTIAL_REFUND : PaymentType.REFUND,
      status: TransactionStatus.SUCCEEDED,
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: refund.charge as string,
      transactionId: refund.id,
      metadata: {
        originalPaymentId: payment._id,
        refundReason: reason
      }
    });

    // Update booking
    const booking = await BookingModel.findByIdAndUpdate(
      payment.booking,
      {
        paymentStatus: amount ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
        bookingStatus: BookingStatus.REFUNDED,
        refundAmount: refund.amount / 100,
        refundDate: new Date()
      },
      { new: true }
    );

    return {
      refund,
      refundPayment,
      booking
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Refund failed: ${error.message}`);
  }
};

const getPaymentsByBooking = async (bookingId: string) => {
  try {
    const payments = await PaymentModel.find({ booking: bookingId }).sort({ createdAt: -1 });
    return payments;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to retrieve payments: ${error.message}`);
  }
};

const handleStripeWebhook = async (signature: string, payload: string) => {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await confirmPayment(paymentIntent.id);
        break;
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await confirmPayment(failedPaymentIntent.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, `Webhook signature verification failed: ${error.message}`);
  }
};

export const StripeService = {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getPaymentsByBooking,
  handleStripeWebhook
};
