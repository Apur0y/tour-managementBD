import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status-codes';
import { AppError } from '../errorHelpers/AppError';
import { User } from '../modules/user/user.model';
import { catchAsync } from '../utils/catchAsync';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let accessToken: string | undefined;
    
    // First, try to get token from Authorization header (for API clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // If no token in header, try to get from cookies (for web clients)
    if (!accessToken && req.cookies) {
      accessToken = req.cookies.accessToken;
    }
    
    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Access token required. Please provide token in Authorization header or cookies.');
    }

    try {
      const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key';
      
      // Verify token
      const decoded = jwt.verify(accessToken, JWT_SECRET) as JwtPayload;

      if (!decoded || !decoded.userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
      }

      // Find user by ID
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
      }

      // Check if user is active and not deleted
      if (user.isDeleted) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'This account has been deleted');
      }

      if (user.isActive !== 'ACTIVE') {
        throw new AppError(httpStatus.UNAUTHORIZED, 'This account is not active');
      }

      // Check role authorization
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Insufficient permissions');
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }
  });
};
