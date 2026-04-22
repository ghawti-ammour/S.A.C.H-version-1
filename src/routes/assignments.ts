import { Router, Response } from 'express';
import { AssignmentRepository } from '../repositories/AssignmentRepository';
import { authMiddleware, adminMiddleware, AuthRequest } from './auth';

const router = Router();

// ===== ASSIGNMENTS =====
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await AssignmentRepository.getAll();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await AssignmentRepository.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Assignment not found' });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/teacher/:teacherId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await AssignmentRepository.getByTeacher(req.params.teacherId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/module/:moduleId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await AssignmentRepository.getByModule(req.params.moduleId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId, moduleId, type, hours } = req.body;
    if (!teacherId || !moduleId || !type) {
      return res.status(400).json({ error: 'TeacherId, moduleId, and type required' });
    }

    await AssignmentRepository.create({
      teacherId,
      moduleId,
      type,
      hours: hours || 0,
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await AssignmentRepository.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await AssignmentRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
