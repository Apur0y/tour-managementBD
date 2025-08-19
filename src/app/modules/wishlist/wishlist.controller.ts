import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { WishlistService } from "./wishlist.service";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../errorHelpers/AppError";

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const { tourId } = req.body;
  const wishlist = await WishlistService.addToWishlist(userId, tourId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tour added to wishlist successfully!",
    data: wishlist,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const { tourId } = req.params;
  const wishlist = await WishlistService.removeFromWishlist(userId, tourId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tour removed from wishlist successfully!",
    data: wishlist,
  });
});

const getUserWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await WishlistService.getUserWishlist(userId, page, limit);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Wishlist retrieved successfully!",
    data: result,
  });
});

const checkTourInWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const { tourId } = req.params;
  const result = await WishlistService.checkTourInWishlist(userId, tourId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Wishlist status retrieved successfully!",
    data: result,
  });
});

const clearWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const result = await WishlistService.clearWishlist(userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Wishlist cleared successfully!",
    data: result,
  });
});

const getWishlistStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const stats = await WishlistService.getWishlistStats(userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Wishlist stats retrieved successfully!",
    data: stats,
  });
});

export const WishlistControllers = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  checkTourInWishlist,
  clearWishlist,
  getWishlistStats
};
