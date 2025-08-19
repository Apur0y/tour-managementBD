import { model, Schema } from "mongoose";
import { IPayment, PaymentMethod, PaymentType, TransactionStatus } from "./payment.interface";

const paymentSchema = new Schema<IPayment>({
  booking: { 
    type: Schema.Types.ObjectId, 
    ref: "Booking", 
    required: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    required: true, 
    default: "usd",
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  paymentType: {
    type: String,
    enum: Object.values(PaymentType),
    default: PaymentType.BOOKING
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING
  },
  stripePaymentIntentId: { 
    type: String, 
    required: true 
  },
  stripeChargeId: { 
    type: String 
  },
  transactionId: { 
    type: String 
  },
  failureReason: { 
    type: String 
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ status: 1 });

export const PaymentModel = model<IPayment>("Payment", paymentSchema);
