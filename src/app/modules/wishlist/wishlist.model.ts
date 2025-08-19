import { model, Schema } from "mongoose";
import { IWishlist } from "./wishlist.interface";

const wishlistSchema = new Schema<IWishlist>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true // One wishlist per user
  },
  tours: [{
    type: Schema.Types.ObjectId, 
    ref: "tours"
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ "tours": 1 });

export const WishlistModel = model<IWishlist>("Wishlist", wishlistSchema);
