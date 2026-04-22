import { Router, Response } from 'express';
import { ParcoursRepository } from '../repositories/ParcoursRepository';
import { authMiddleware, adminMiddleware, AuthRequest } from './auth';

const router = Router();

// ===== PARCOURS =====
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ParcoursRepository.getAll();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ParcoursRepository.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Parcours not found' });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/type/:type', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ParcoursRepository.getByType(req.params.type);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, level, year, specialty, description } = req.body;
    if (!name || !type || !year || !specialty) {
      return res.status(400).json({ error: 'Name, type, year, and specialty required' });
    }

    await ParcoursRepository.create({
      name,
      type,
      level,
      year,
      specialty,
      description: description || '',
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await ParcoursRepository.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await ParcoursRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
