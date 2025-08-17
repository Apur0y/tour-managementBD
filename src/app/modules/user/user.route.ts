import { Router } from "express";
import { UserControllers } from "./user.controler";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { auth } from "../../middlewares/auth";

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

export const UserRoutes = router;
