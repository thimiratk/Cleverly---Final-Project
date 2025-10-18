import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // First, try to get token from Authorization header
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    // If no Authorization header, try to get token from cookies
    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Use ACCESS_TOKEN_SECRET for token verification (matching the login controller)
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default isAuthenticated;