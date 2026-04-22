import { Router, Response } from 'express';
import { MessageRepository } from '../repositories/MessageRepository';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// ===== MESSAGES =====
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await MessageRepository.getAll();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await MessageRepository.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Message not found' });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/receiver/:receiverId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await MessageRepository.getByReceiver(req.params.receiverId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/between/:senderId/:receiverId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await MessageRepository.getBetween(req.params.senderId, req.params.receiverId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { senderId, receiverId, content, moduleId, moduleType, hours } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'SenderId, receiverId, and content required' });
    }

    await MessageRepository.create({
      senderId,
      receiverId,
      content,
      status: 'PENDING',
      moduleId,
      moduleType,
      hours,
      isRead: 0,
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await MessageRepository.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await MessageRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
