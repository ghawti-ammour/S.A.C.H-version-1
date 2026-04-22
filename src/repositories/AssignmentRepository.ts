import { getOne, getAll, run } from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface AssignmentData {
  id: string;
  teacherId: string;
  moduleId: string;
  type: string;
  hours: number;
}

export const AssignmentRepository = {
  findById: async (id: string): Promise<AssignmentData | null> => {
    return getOne<AssignmentData>(
      'SELECT * FROM assignments WHERE id = ?',
      [id]
    );
  },

  getAll: async (): Promise<AssignmentData[]> => {
    return getAll<AssignmentData>('SELECT * FROM assignments', []);
  },

  getByTeacher: async (teacherId: string): Promise<AssignmentData[]> => {
    return getAll<AssignmentData>(
      'SELECT * FROM assignments WHERE teacherId = ?',
      [teacherId]
    );
  },

  getByModule: async (moduleId: string): Promise<AssignmentData[]> => {
    return getAll<AssignmentData>(
      'SELECT * FROM assignments WHERE moduleId = ?',
      [moduleId]
    );
  },

  create: async (data: Omit<AssignmentData, 'id'>): Promise<AssignmentData> => {
    const id = uuidv4();
    await run(
      'INSERT INTO assignments (id, teacherId, moduleId, type, hours) VALUES (?, ?, ?, ?, ?)',
      [id, data.teacherId, data.moduleId, data.type, data.hours]
    );
    return { id, ...data };
  },

  update: async (id: string, data: Partial<AssignmentData>): Promise<void> => {
    const fields = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!fields) return;

    const values = Object.entries(data)
      .filter(([key]) => key !== 'id')
      .map(([, val]) => val);

    await run(
      `UPDATE assignments SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: async (id: string): Promise<void> => {
    await run('DELETE FROM assignments WHERE id = ?', [id]);
  },
};
