import { getOne, getAll, run } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface ParcoursData {
  id: string;
  name: string;
  type: string;
  level?: string;
  year: number;
  specialty: string;
  description: string;
}

export const ParcoursRepository = {
  findById: async (id: string): Promise<ParcoursData | null> => {
    return getOne<ParcoursData>(
      'SELECT * FROM parcours WHERE id = ?',
      [id]
    );
  },

  getAll: async (): Promise<ParcoursData[]> => {
    return getAll<ParcoursData>('SELECT * FROM parcours', []);
  },

  getByType: async (type: string): Promise<ParcoursData[]> => {
    return getAll<ParcoursData>(
      'SELECT * FROM parcours WHERE type = ?',
      [type]
    );
  },

  create: async (data: Omit<ParcoursData, 'id'>): Promise<ParcoursData> => {
    const id = uuidv4();
    await run(
      'INSERT INTO parcours (id, name, type, level, year, specialty, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.name, data.type, data.level || null, data.year, data.specialty, data.description]
    );
    return { id, ...data };
  },

  update: async (id: string, data: Partial<ParcoursData>): Promise<void> => {
    const fields = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!fields) return;

    const values = Object.entries(data)
      .filter(([key]) => key !== 'id')
      .map(([, val]) => val);

    await run(
      `UPDATE parcours SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: async (id: string): Promise<void> => {
    await run('DELETE FROM parcours WHERE id = ?', [id]);
  },
};
