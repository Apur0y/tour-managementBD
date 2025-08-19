import { Router } from "express";
import { WishlistControllers } from "./wishlist.controller";
import validateRequest from "../../middlewares/validateRequest";
import { wishlistValidation } from "./wishlist.validation";
import { auth } from "../../middlewares/auth";

const router = Router();

// Add tour to wishlist
router.post(
  "/",
  auth(), // Any authenticated user can add to wishlist
  validateRequest(wishlistValidation.addToWishlistZodSchema),
  WishlistControllers.addToWishlist
);

// Get user's wishlist
router.get(
  "/",
  auth(), // Any authenticated user can view their wishlist
  validateRequest(wishlistValidation.getWishlistQueryZodSchema),
  WishlistControllers.getUserWishlist
);

// Get wishlist statistics
router.get(
  "/stats",
  auth(), // Any authenticated user can view their wishlist stats
  WishlistControllers.getWishlistStats
);

// Check if tour is in wishlist
router.get(
  "/check/:tourId",
  auth(), // Any authenticated user can check wishlist status
  validateRequest(wishlistValidation.checkWishlistZodSchema),
  WishlistControllers.checkTourInWishlist
);

// Remove tour from wishlist
router.delete(
  "/:tourId",
  auth(), // Any authenticated user can remove from wishlist
  validateRequest(wishlistValidation.removeFromWishlistZodSchema),
  WishlistControllers.removeFromWishlist
);

// Clear entire wishlist
router.delete(
  "/",
  auth(), // Any authenticated user can clear their wishlist
  WishlistControllers.clearWishlist
);

export const WishlistRoutes = router;
