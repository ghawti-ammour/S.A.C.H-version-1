import { getOne, getAll, run } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  password: string;
  grade?: string;
  specialty?: string;
  status?: string;
  requiredHours?: number;
  profilePhoto?: string;
}

export const TeacherRepository = {
  findById: async (id: string): Promise<TeacherUser | null> => {
    return getOne<TeacherUser>(
      'SELECT * FROM teachers WHERE id = ?',
      [id]
    );
  },

  findByEmail: async (email: string): Promise<TeacherUser | null> => {
    return getOne<TeacherUser>(
      'SELECT * FROM teachers WHERE email = ?',
      [email]
    );
  },

  getAll: async (): Promise<TeacherUser[]> => {
    return getAll<TeacherUser>('SELECT * FROM teachers', []);
  },

  create: async (data: Omit<TeacherUser, 'id'>): Promise<TeacherUser> => {
    const id = uuidv4();
    await run(
      'INSERT INTO teachers (id, name, email, password, grade, specialty, status, requiredHours, profilePhoto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.name, data.email, data.password, data.grade || null, data.specialty || null, data.status || null, data.requiredHours || 0, data.profilePhoto || null]
    );
    return { id, ...data };
  },

  update: async (id: string, data: Partial<TeacherUser>): Promise<void> => {
    const fields = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!fields) return;

    const values = Object.entries(data)
      .filter(([key]) => key !== 'id')
      .map(([, val]) => val);

    await run(
      `UPDATE teachers SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: async (id: string): Promise<void> => {
    await run('DELETE FROM teachers WHERE id = ?', [id]);
  },
};
