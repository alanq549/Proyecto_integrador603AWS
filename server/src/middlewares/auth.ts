// auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
    rol: string; // ← agregalo
  // …otras props si quieres
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token no proporcionado' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    (req as any).user = {
      id: payload.userId,
      rol: payload.rol // ← ahora está disponible en todos los controladores
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}