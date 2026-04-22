import { getOne, getAll, run } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface ModuleData {
  id: string;
  code: string;
  name: string;
  semester: number;
  cmHours: number;
  tdHours: number;
  tpHours: number;
  parcoursId: string;
}

export const ModuleRepository = {
  findById: async (id: string): Promise<ModuleData | null> => {
    return getOne<ModuleData>(
      'SELECT * FROM modules WHERE id = ?',
      [id]
    );
  },

  getAll: async (): Promise<ModuleData[]> => {
    return getAll<ModuleData>('SELECT * FROM modules', []);
  },

  getByParcours: async (parcoursId: string): Promise<ModuleData[]> => {
    return getAll<ModuleData>(
      'SELECT * FROM modules WHERE parcoursId = ?',
      [parcoursId]
    );
  },

  create: async (data: Omit<ModuleData, 'id'>): Promise<ModuleData> => {
    const id = uuidv4();
    await run(
      'INSERT INTO modules (id, code, name, semester, cmHours, tdHours, tpHours, parcoursId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.code, data.name, data.semester, data.cmHours, data.tdHours, data.tpHours, data.parcoursId]
    );
    return { id, ...data };
  },

  update: async (id: string, data: Partial<ModuleData>): Promise<void> => {
    const fields = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!fields) return;

    const values = Object.entries(data)
      .filter(([key]) => key !== 'id')
      .map(([, val]) => val);

    await run(
      `UPDATE modules SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: async (id: string): Promise<void> => {
    await run('DELETE FROM modules WHERE id = ?', [id]);
  },
};
