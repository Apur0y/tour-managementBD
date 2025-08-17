import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);
  
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "User created successfully!",
    data: user,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.loginUser(req.body);
  
  const { user, accessToken, refreshToken } = result;
  
  // Set cookies with secure options
  const cookieOptions = {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict' as const, // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for access token
  };
  
  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
  };
  
  // Set cookies
  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "User logged in successfully!",
    data: {
      user, // Only return user data, not tokens
    },
  });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  // User is already available from auth middleware
  const user = req.user;
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "User retrieved successfully!",
    data: user,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear both access and refresh token cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };
  
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  
  res.status(httpStatus.OK).json({
    success: true,
    message: "User logged out successfully!",
  });
});

export const UserControllers = {
  createUser,
  loginUser,
  getUser,
  logoutUser,
};
