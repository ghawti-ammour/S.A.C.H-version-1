import { getOne, getAll, run } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface MessageData {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  status: string;
  moduleId?: string;
  moduleType?: string;
  hours?: number;
  isRead: number;
}

export const MessageRepository = {
  findById: async (id: string): Promise<MessageData | null> => {
    return getOne<MessageData>(
      'SELECT * FROM messages WHERE id = ?',
      [id]
    );
  },

  getAll: async (): Promise<MessageData[]> => {
    return getAll<MessageData>('SELECT * FROM messages', []);
  },

  getByReceiver: async (receiverId: string): Promise<MessageData[]> => {
    return getAll<MessageData>(
      'SELECT * FROM messages WHERE receiverId = ? ORDER BY createdAt DESC',
      [receiverId]
    );
  },

  getBetween: async (senderId: string, receiverId: string): Promise<MessageData[]> => {
    return getAll<MessageData>(
      'SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY createdAt DESC',
      [senderId, receiverId, receiverId, senderId]
    );
  },

  create: async (data: Omit<MessageData, 'id' | 'createdAt'>): Promise<MessageData> => {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    await run(
      'INSERT INTO messages (id, senderId, receiverId, content, createdAt, status, moduleId, moduleType, hours, isRead) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.senderId, data.receiverId, data.content, createdAt, data.status || 'PENDING', data.moduleId || null, data.moduleType || null, data.hours || null, 0]
    );
    return { id, ...data, createdAt, isRead: 0 };
  },

  update: async (id: string, data: Partial<MessageData>): Promise<void> => {
    const fields = Object.keys(data)
      .filter(key => !['id', 'createdAt'].includes(key))
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!fields) return;

    const values = Object.entries(data)
      .filter(([key]) => !['id', 'createdAt'].includes(key))
      .map(([, val]) => val);

    await run(
      `UPDATE messages SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: async (id: string): Promise<void> => {
    await run('DELETE FROM messages WHERE id = ?', [id]);
  },
};
