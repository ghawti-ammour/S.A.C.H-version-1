import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const user = AuthService.verifyToken(token);
  if (!user) return res.status(403).json({ error: 'Invalid token' });

  req.user = user;
  next();
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

// ===== LOGIN =====
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    if (result.success) {
      res.json({ success: true, token: result.token, userId: result.userId, role: result.role });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
