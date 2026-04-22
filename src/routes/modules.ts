import { Router, Request, Response } from 'express';
import { ModuleRepository } from '../repositories/ModuleRepository';
import { authMiddleware, adminMiddleware, AuthRequest } from './auth';

const router = Router();

// ===== MODULES =====
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ModuleRepository.getAll();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ModuleRepository.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Module not found' });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/parcours/:parcoursId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ModuleRepository.getByParcours(req.params.parcoursId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, semester, cmHours, tdHours, tpHours, parcoursId } = req.body;
    if (!code || !name || !parcoursId) {
      return res.status(400).json({ error: 'Code, name, and parcoursId required' });
    }

    await ModuleRepository.create({
      code,
      name,
      semester: semester || 1,
      cmHours: cmHours || 0,
      tdHours: tdHours || 0,
      tpHours: tpHours || 0,
      parcoursId,
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await ModuleRepository.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await ModuleRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
