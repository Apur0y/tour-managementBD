import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { Role } from '../modules/user/user.interface';

export interface JwtPayload {
  userId: Types.ObjectId;
  email: string;
  role: Role;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-key';
  const JWT_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '7d';

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const JWT_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  const JWT_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Simple hash function using crypto (for demo purposes)
// In production, use bcrypt for better security
export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const [salt, hash] = hashedPassword.split(':');
  const hashToCompare = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashToCompare;
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
