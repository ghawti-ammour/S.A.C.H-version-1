import { Router, Response } from 'express';
import { TeacherRepository } from '../repositories/TeacherRepository';
import { AuthService } from '../services/AuthService';
import { authMiddleware, adminMiddleware, AuthRequest } from './auth';

const router = Router();

// ===== TEACHERS =====
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await TeacherRepository.getAll();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await TeacherRepository.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Teacher not found' });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }

    const hashed = await AuthService.hashPassword(password || '123456');
    await TeacherRepository.create({ name, email, password: hashed });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await TeacherRepository.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await TeacherRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
