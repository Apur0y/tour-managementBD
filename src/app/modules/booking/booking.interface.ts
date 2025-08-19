import { Types } from "mongoose";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  REFUNDED = "REFUNDED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}

export interface IBooking {
  user: Types.ObjectId;
  tour: Types.ObjectId;
  bookingDate: Date;
  numberOfPeople: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paymentMethod?: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateBookingPayload {
  tourId: string;
  numberOfPeople: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
}

export interface IPaymentIntentPayload {
  bookingId: string;
  amount: number;
  currency?: string;
}
