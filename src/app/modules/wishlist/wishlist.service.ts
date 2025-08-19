import { WishlistModel } from './wishlist.model';
import { TourModel } from '../tour/tour.model';
import { AppError } from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes';

const addToWishlist = async (userId: string, tourId: string) => {
  try {
    // Verify tour exists and is active
    const tour = await TourModel.findById(tourId);
    if (!tour) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tour not found');
    }

    if (!tour.isActive) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Cannot add inactive tour to wishlist');
    }

    // Find or create user's wishlist
    let wishlist = await WishlistModel.findOne({ user: userId });
    
    if (!wishlist) {
      // Create new wishlist if doesn't exist
      wishlist = await WishlistModel.create({
        user: userId,
        tours: [tourId]
      });
    } else {
      // Check if tour is already in wishlist
      if (wishlist.tours.includes(tourId as any)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Tour is already in wishlist');
      }

      // Add tour to existing wishlist
      wishlist.tours.push(tourId as any);
      await wishlist.save();
    }

    // Return wishlist with populated tours
    const populatedWishlist = await WishlistModel.findById(wishlist._id)
      .populate('tours', 'title location costFrom startDate endDate images slug');

    return populatedWishlist;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to add tour to wishlist: ${error.message}`);
  }
};

const removeFromWishlist = async (userId: string, tourId: string) => {
  try {
    // Find user's wishlist
    const wishlist = await WishlistModel.findOne({ user: userId });
    
    if (!wishlist) {
      throw new AppError(httpStatus.NOT_FOUND, 'Wishlist not found');
    }

    // Check if tour is in wishlist
    if (!wishlist.tours.includes(tourId as any)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Tour is not in wishlist');
    }

    // Remove tour from wishlist
    wishlist.tours = wishlist.tours.filter(id => id.toString() !== tourId);
    await wishlist.save();

    // Return updated wishlist with populated tours
    const populatedWishlist = await WishlistModel.findById(wishlist._id)
      .populate('tours', 'title location costFrom startDate endDate images slug');

    return populatedWishlist;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to remove tour from wishlist: ${error.message}`);
  }
};

const getUserWishlist = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    // Find user's wishlist and populate tours with pagination
    const wishlist = await WishlistModel.findOne({ user: userId })
      .populate({
        path: 'tours',
        select: 'title location costFrom startDate endDate images slug isActive',
        match: { isActive: true }, // Only show active tours
        options: {
          skip: skip,
          limit: limit,
          sort: { createdAt: -1 }
        }
      });

    if (!wishlist) {
      return {
        tours: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      };
    }

    // Get total count of active tours in wishlist
    const totalActiveTours = await TourModel.countDocuments({
      _id: { $in: wishlist.tours },
      isActive: true
    });

    return {
      tours: wishlist.tours,
      pagination: {
        page,
        limit,
        total: totalActiveTours,
        pages: Math.ceil(totalActiveTours / limit)
      }
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to retrieve wishlist: ${error.message}`);
  }
};

const checkTourInWishlist = async (userId: string, tourId: string) => {
  try {
    const wishlist = await WishlistModel.findOne({ 
      user: userId, 
      tours: tourId 
    });

    return {
      inWishlist: !!wishlist
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to check wishlist status: ${error.message}`);
  }
};

const clearWishlist = async (userId: string) => {
  try {
    const wishlist = await WishlistModel.findOne({ user: userId });
    
    if (!wishlist) {
      throw new AppError(httpStatus.NOT_FOUND, 'Wishlist not found');
    }

    wishlist.tours = [];
    await wishlist.save();

    return {
      message: 'Wishlist cleared successfully'
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to clear wishlist: ${error.message}`);
  }
};

const getWishlistStats = async (userId: string) => {
  try {
    const wishlist = await WishlistModel.findOne({ user: userId });
    
    if (!wishlist) {
      return {
        totalTours: 0,
        activeTours: 0,
        inactiveTours: 0
      };
    }

    const activeTours = await TourModel.countDocuments({
      _id: { $in: wishlist.tours },
      isActive: true
    });

    const inactiveTours = wishlist.tours.length - activeTours;

    return {
      totalTours: wishlist.tours.length,
      activeTours,
      inactiveTours
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to get wishlist stats: ${error.message}`);
  }
};

export const WishlistService = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  checkTourInWishlist,
  clearWishlist,
  getWishlistStats
};
