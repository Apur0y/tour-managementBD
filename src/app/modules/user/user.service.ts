import jwt from 'jsonwebtoken';
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from "../../utils/auth.utils";
import { AppError } from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

interface LoginResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    picture?: string;
    address?: string;
    isActive: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

const createUser = async (payload: Partial<IUser>) => {
  const { name, email, password, phone, picture, address, role } = payload;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "User already exists with this email");
  }

  // Hash password if provided
  let hashedPassword;
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    picture,
    address,
    role,
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

const loginUser = async (payload: Partial<IUser>): Promise<LoginResponse> => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required");
  }

  // Find user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Check if user is active
  if (user.isDeleted) {
    throw new AppError(httpStatus.UNAUTHORIZED, "This account has been deleted");
  }

  if (user.isActive !== "ACTIVE") {
    throw new AppError(httpStatus.UNAUTHORIZED, "This account is not active");
  }

  // Check password
  if (!user.password) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Please set up a password for your account");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Generate tokens
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  // Prepare user response (without password)
  const userResponse = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    picture: user.picture,
    address: user.address,
    isActive: user.isActive,
    isVerified: user.isVerified,
  };

  return {
    user: userResponse,
    accessToken,
    refreshToken,
  };
};

const getUser = async (accessToken: string) => {
  try {
    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Access token required");
    }

    const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key';

    // Verify token
    const decoded = jwt.verify(accessToken, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    if (!decoded || !decoded.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    // Find user by ID
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Check if user is active and not deleted
    if (user.isDeleted) {
      throw new AppError(httpStatus.UNAUTHORIZED, "This account has been deleted");
    }

    if (user.isActive !== "ACTIVE") {
      throw new AppError(httpStatus.UNAUTHORIZED, "This account is not active");
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
};
const updateProfile = async (userId: string, payload: Partial<IUser>, filePath?: string) => {
  const { name, phone, address } = payload;
  
  // Build update object
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (filePath) updateData.picture = filePath;

  // Check if user exists
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if user is active and not deleted
  if (existingUser.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot update deleted account");
  }

  if (existingUser.isActive !== "ACTIVE") {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot update inactive account");
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update profile");
  }

  return updatedUser;
};

const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  // Find user with password
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if user is active and not deleted
  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot change password for deleted account");
  }

  if (user.isActive !== "ACTIVE") {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot change password for inactive account");
  }

  // Check if user has a password (for social login users)
  if (!user.password) {
    throw new AppError(httpStatus.BAD_REQUEST, "No password set for this account. Please set up a password first");
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
  }

  // Check if new password is different from current password
  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "New password must be different from current password");
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { password: hashedNewPassword },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to change password");
  }

  return updatedUser;
};

export const UserServices = {
  createUser,
  loginUser,
  getUser,
  updateProfile,
  changePassword,
};
