import { Types } from "mongoose";

export enum PaymentMethod {
  CARD = "CARD",
  PAYPAL = "PAYPAL",
  APPLE_PAY = "APPLE_PAY",
  GOOGLE_PAY = "GOOGLE_PAY"
}

export enum PaymentType {
  BOOKING = "BOOKING",
  REFUND = "REFUND",
  PARTIAL_REFUND = "PARTIAL_REFUND"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  CANCELED = "CANCELED"
}

export interface IPayment {
  booking: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  status: TransactionStatus;
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  transactionId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreatePaymentIntentPayload {
  amount: number;
  currency?: string;
  bookingId: string;
  metadata?: Record<string, any>;
}

export interface IConfirmPaymentPayload {
  paymentIntentId: string;
  paymentMethodId?: string;
}
