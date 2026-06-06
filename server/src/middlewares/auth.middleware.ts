import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_1234';

type JwtPayload = {
  userId: string;
  name?: string;
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ message: 'Missing authorization token' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.userId,
      name: payload.name,
    };
    next();
  } catch (error: unknown) {
    const message = error instanceof jwt.TokenExpiredError
      ? 'Token expired'
      : error instanceof jwt.JsonWebTokenError
        ? 'Invalid token'
        : 'Failed to verify token';
    res.status(401).json({ message });
  }
};
