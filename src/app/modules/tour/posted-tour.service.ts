import { TourModel } from './tour.model';
import { BookingModel } from '../booking/booking.model';
import { AppError } from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes';
import { ITour } from './tour.interface';
import { BookingStatus } from '../booking/booking.interface';

const createTour = async (guideId: string, tourData: Partial<ITour>) => {
  try {
    // Set the guide as the tour creator
    const tourPayload = {
      ...tourData,
      guide: guideId,
      isActive: true
    };

    const tour = await TourModel.create(tourPayload);
    return tour;
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to create tour: ${error.message}`);
  }
};

const getMyTours = async (
  guideId: string,
  isActive?: boolean,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const query: any = { guide: guideId };
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const tours = await TourModel.find(query)
      .populate('tourType', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TourModel.countDocuments(query);

    // Get booking statistics for each tour
    const toursWithStats = await Promise.all(
      tours.map(async (tour) => {
        const bookingStats = await getBookingStats(tour._id.toString());
        return {
          ...tour.toObject(),
          bookingStats
        };
      })
    );

    return {
      tours: toursWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to retrieve tours: ${error.message}`);
  }
};

const getTourById = async (tourId: string, guideId: string) => {
  try {
    const tour = await TourModel.findOne({ _id: tourId, guide: guideId })
      .populate('tourType', 'name');

    if (!tour) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tour not found or access denied');
    }

    // Get detailed booking statistics
    const bookingStats = await getDetailedBookingStats(tourId);

    return {
      ...tour.toObject(),
      bookingStats
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to retrieve tour: ${error.message}`);
  }
};

const updateTour = async (tourId: string, guideId: string, updateData: Partial<ITour>) => {
  try {
    // Remove fields that shouldn't be updated
    const { guide, createdAt, updatedAt, ...allowedUpdates } = updateData as any;

    const tour = await TourModel.findOneAndUpdate(
      { _id: tourId, guide: guideId },
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate('tourType', 'name');

    if (!tour) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tour not found or access denied');
    }

    return tour;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to update tour: ${error.message}`);
  }
};

const deleteTour = async (tourId: string, guideId: string) => {
  try {
    // Check if tour has any confirmed bookings
    const confirmedBookings = await BookingModel.countDocuments({
      tour: tourId,
      bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
    });

    if (confirmedBookings > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        'Cannot delete tour with confirmed or pending bookings. Please cancel all bookings first.'
      );
    }

    const tour = await TourModel.findOneAndDelete({ _id: tourId, guide: guideId });

    if (!tour) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tour not found or access denied');
    }

    return {
      message: 'Tour deleted successfully',
      deletedTour: tour
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to delete tour: ${error.message}`);
  }
};

const toggleTourStatus = async (tourId: string, guideId: string) => {
  try {
    const tour = await TourModel.findOne({ _id: tourId, guide: guideId });

    if (!tour) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tour not found or access denied');
    }

    // Toggle the isActive status
    tour.isActive = !tour.isActive;
    await tour.save();

    return tour;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to toggle tour status: ${error.message}`);
  }
};

const getDashboardStats = async (guideId: string) => {
  try {
    // Get tour statistics
    const totalTours = await TourModel.countDocuments({ guide: guideId });
    const activeTours = await TourModel.countDocuments({ guide: guideId, isActive: true });
    const inactiveTours = totalTours - activeTours;

    // Get all tour IDs for this guide
    const tourIds = await TourModel.find({ guide: guideId }).distinct('_id');

    // Get booking statistics
    const totalBookings = await BookingModel.countDocuments({ tour: { $in: tourIds } });
    const pendingBookings = await BookingModel.countDocuments({ 
      tour: { $in: tourIds }, 
      bookingStatus: BookingStatus.PENDING 
    });
    const confirmedBookings = await BookingModel.countDocuments({ 
      tour: { $in: tourIds }, 
      bookingStatus: BookingStatus.CONFIRMED 
    });
    const completedBookings = await BookingModel.countDocuments({ 
      tour: { $in: tourIds }, 
      bookingStatus: BookingStatus.COMPLETED 
    });
    const cancelledBookings = await BookingModel.countDocuments({ 
      tour: { $in: tourIds }, 
      bookingStatus: BookingStatus.CANCELLED 
    });

    // Calculate total revenue (from completed and confirmed bookings)
    const revenueBookings = await BookingModel.find({ 
      tour: { $in: tourIds }, 
      bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
    }).select('totalAmount');

    const totalRevenue = revenueBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Get recent bookings (last 10)
    const recentBookings = await BookingModel.find({ tour: { $in: tourIds } })
      .populate('tour', 'title')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      tourStats: {
        total: totalTours,
        active: activeTours,
        inactive: inactiveTours
      },
      bookingStats: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      },
      revenue: {
        total: totalRevenue,
        currency: 'USD'
      },
      recentBookings
    };
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to get dashboard stats: ${error.message}`);
  }
};

// Helper function to get booking statistics for a tour
const getBookingStats = async (tourId: string) => {
  try {
    const total = await BookingModel.countDocuments({ tour: tourId });
    const confirmed = await BookingModel.countDocuments({ 
      tour: tourId, 
      bookingStatus: BookingStatus.CONFIRMED 
    });
    const pending = await BookingModel.countDocuments({ 
      tour: tourId, 
      bookingStatus: BookingStatus.PENDING 
    });

    return {
      total,
      confirmed,
      pending
    };
  } catch (error: any) {
    return {
      total: 0,
      confirmed: 0,
      pending: 0
    };
  }
};

// Helper function to get detailed booking statistics
const getDetailedBookingStats = async (tourId: string) => {
  try {
    const stats = await BookingModel.aggregate([
      { $match: { tour: tourId } },
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPeople: { $sum: '$numberOfPeople' }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
      totalPeople: 0
    };

    stats.forEach(stat => {
      result.total += stat.count;
      result.totalPeople += stat.totalPeople;
      
      switch (stat._id) {
        case BookingStatus.PENDING:
          result.pending = stat.count;
          break;
        case BookingStatus.CONFIRMED:
          result.confirmed = stat.count;
          result.totalRevenue += stat.totalAmount;
          break;
        case BookingStatus.COMPLETED:
          result.completed = stat.count;
          result.totalRevenue += stat.totalAmount;
          break;
        case BookingStatus.CANCELLED:
          result.cancelled = stat.count;
          break;
      }
    });

    return result;
  } catch (error: any) {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
      totalPeople: 0
    };
  }
};

export const PostedTourService = {
  createTour,
  getMyTours,
  getTourById,
  updateTour,
  deleteTour,
  toggleTourStatus,
  getDashboardStats
};
