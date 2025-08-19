import { Router } from "express";
import { UserControllers } from "./user.controler";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { auth } from "../../middlewares/auth";
import { uploadProfilePicture, handleMulterError } from "../../middlewares/upload";

const router = Router();

router.post(
  "/register",
  validateRequest(userValidation.createUserZodSchema),
  UserControllers.createUser
);

router.post(
  "/login",
  validateRequest(userValidation.loginUserZodSchema),
  UserControllers.loginUser
);

// Get current user by access token
router.get(
  "/me",
  auth(), // No specific role required, any authenticated user can access their own profile
  UserControllers.getUser
);

// Logout user and clear cookies
router.post(
  "/logout",
  auth(), // User must be authenticated to logout
  UserControllers.logoutUser
);

// Update user profile with optional file upload
router.put(
  "/profile",
  auth(), // User must be authenticated to update profile
  uploadProfilePicture, // Handle file upload (optional)
  handleMulterError, // Handle multer errors
  validateRequest(userValidation.updateProfileZodSchema),
  UserControllers.updateProfile
);

// Change user password
router.put(
  "/change-password",
  auth(), // User must be authenticated to change password
  validateRequest(userValidation.changePasswordZodSchema),
  UserControllers.changePassword
);

export const UserRoutes = router;
