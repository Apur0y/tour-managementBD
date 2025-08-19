import { model, Schema } from "mongoose";
import { BookingStatus, IBooking, PaymentStatus } from "./booking.interface";

const customerDetailsSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialRequests: { type: String }
}, { _id: false });

const bookingSchema = new Schema<IBooking>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  tour: { 
    type: Schema.Types.ObjectId, 
    ref: "tours", 
    required: true 
  },
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
  numberOfPeople: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  bookingStatus: {
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING
  },
  stripePaymentIntentId: { 
    type: String 
  },
  stripeSessionId: { 
    type: String 
  },
  paymentMethod: { 
    type: String 
  },
  customerDetails: {
    type: customerDetailsSchema,
    required: true
  },
  cancellationReason: { 
    type: String 
  },
  refundAmount: { 
    type: Number, 
    min: 0 
  },
  refundDate: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ tour: 1, createdAt: -1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });

export const BookingModel = model<IBooking>("Booking", bookingSchema);
