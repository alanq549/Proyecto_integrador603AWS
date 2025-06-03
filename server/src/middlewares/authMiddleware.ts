// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

// Extender la interfaz Request para incluir la propiedad 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    
    // Añadir información del usuario al request
    req.user = user;
    next();
  });
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};