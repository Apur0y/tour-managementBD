import { Router } from "express";
import { PostedTourControllers } from "./posted-tour.controller";
import validateRequest from "../../middlewares/validateRequest";
import { postedTourValidation } from "./posted-tour.validation";
import { auth } from "../../middlewares/auth";
import { Role } from "../user/user.interface";

const router = Router();

// Dashboard statistics (should be before other routes to avoid conflicts)
router.get(
  "/dashboard/stats",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  PostedTourControllers.getDashboardStats
);

// Create a new tour
router.post(
  "/",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins can create tours
  validateRequest(postedTourValidation.createTourZodSchema),
  PostedTourControllers.createTour
);

// Get all tours created by the authenticated guide
router.get(
  "/",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  validateRequest(postedTourValidation.getToursQueryZodSchema),
  PostedTourControllers.getMyTours
);

// Get specific tour details
router.get(
  "/:tourId",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  validateRequest(postedTourValidation.getTourParamsZodSchema),
  PostedTourControllers.getTourById
);

// Update tour
router.put(
  "/:tourId",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  validateRequest(postedTourValidation.getTourParamsZodSchema),
  validateRequest(postedTourValidation.updateTourZodSchema),
  PostedTourControllers.updateTour
);

// Delete tour
router.delete(
  "/:tourId",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  validateRequest(postedTourValidation.getTourParamsZodSchema),
  PostedTourControllers.deleteTour
);

// Toggle tour status (activate/deactivate)
router.put(
  "/:tourId/toggle-status",
  auth(Role.GUIDE, Role.ADMIN), // Only guides and admins
  validateRequest(postedTourValidation.getTourParamsZodSchema),
  PostedTourControllers.toggleTourStatus
);

export const PostedTourRoutes = router;
