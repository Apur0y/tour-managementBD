import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { PostedTourService } from "./posted-tour.service";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../errorHelpers/AppError";

const createTour = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to create tours
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Only guides and admins can create tours");
  }

  // Convert date strings to Date objects
  const tourData = {
    ...req.body,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate)
  };

  const tour = await PostedTourService.createTour(userId, tourData);
  
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Tour created successfully!",
    data: tour,
  });
});

const getMyTours = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to view their tours
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await PostedTourService.getMyTours(userId, isActive, page, limit);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tours retrieved successfully!",
    data: result,
  });
});

const getTourById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { tourId } = req.params;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to view tour details
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const tour = await PostedTourService.getTourById(tourId, userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tour retrieved successfully!",
    data: tour,
  });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { tourId } = req.params;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to update tours
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  // Convert date strings to Date objects if provided
  const updateData = { ...req.body };
  if (updateData.startDate) {
    updateData.startDate = new Date(updateData.startDate);
  }
  if (updateData.endDate) {
    updateData.endDate = new Date(updateData.endDate);
  }

  const tour = await PostedTourService.updateTour(tourId, userId, updateData);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tour updated successfully!",
    data: tour,
  });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { tourId } = req.params;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to delete tours
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const result = await PostedTourService.deleteTour(tourId, userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: result.message,
    data: result.deletedTour,
  });
});

const toggleTourStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const { tourId } = req.params;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to toggle tour status
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const tour = await PostedTourService.toggleTourStatus(tourId, userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: `Tour ${tour.isActive ? 'activated' : 'deactivated'} successfully!`,
    data: tour,
  });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Only allow guides and admins to view dashboard
  if (userRole !== 'GUIDE' && userRole !== 'ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const stats = await PostedTourService.getDashboardStats(userId);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "Dashboard stats retrieved successfully!",
    data: stats,
  });
});

export const PostedTourControllers = {
  createTour,
  getMyTours,
  getTourById,
  updateTour,
  deleteTour,
  toggleTourStatus,
  getDashboardStats
};
