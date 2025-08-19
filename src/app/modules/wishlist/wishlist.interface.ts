import { Types } from "mongoose";

export interface IWishlistItem {
  user: Types.ObjectId;
  tour: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist {
  user: Types.ObjectId;
  tours: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddToWishlistPayload {
  tourId: string;
}

export interface IRemoveFromWishlistPayload {
  tourId: string;
}
