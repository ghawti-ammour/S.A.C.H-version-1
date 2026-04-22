import { getOne, getAll, run } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  profilePhoto?: string;
}

export const AdminRepository = {
  findById: async (id: string): Promise<AdminUser | null> => {
    return getOne<AdminUser>(
      'SELECT * FROM admin_profile WHERE id = ?',
      [id]
    );
  },

  findByEmail: async (email: string): Promise<AdminUser | null> => {
    return getOne<AdminUser>(
      'SELECT * FROM admin_profile WHERE email = ?',
      [email]
    );
  },

  getAll: async (): Promise<AdminUser[]> => {
    return getAll<AdminUser>('SELECT * FROM admin_profile', []);
  },

  create: async (data: Omit<AdminUser, 'id'>): Promise<AdminUser> => {
    const id = uuidv4();
    await run(
      'INSERT INTO admin_profile (id, name, email, password, role, profilePhoto) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.name, data.email, data.password, data.role, data.profilePhoto || null]
    );
    return { id, ...data };
  },

  update: async (id: string, data: Partial<AdminUser>): Promise<void> => {
    const fields = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!fields) return;

    const values = Object.entries(data)
      .filter(([key]) => key !== 'id')
      .map(([, val]) => val);

    await run(
      `UPDATE admin_profile SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: async (id: string): Promise<void> => {
    await run('DELETE FROM admin_profile WHERE id = ?', [id]);
  },
};
