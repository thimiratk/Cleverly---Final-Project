import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

interface JwtPayload {
  id: string;
  role?: "user" | "seller";
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const account = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!account) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: account.id,
      email: account.email,
      name: account.name,
      role: decoded.role
    };
    
    return next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET as string
        ) as JwtPayload;

        if (decoded) {
          const account = await prisma.users.findUnique({ where: { id: decoded.id } });
          if (account) {
            req.user = {
              id: account.id,
              email: account.email,
              name: account.name,
              role: decoded.role
            };
          }
        }
      } catch (error) {
        // Token is invalid, but we don't reject the request
        req.user = undefined;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};