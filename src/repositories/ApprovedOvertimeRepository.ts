import { getAll, run } from '../db';

export interface ApprovedOvertimeData {
  teacherId: string;
  moduleId: string;
}

export const ApprovedOvertimeRepository = {
  getByTeacher: async (teacherId: string): Promise<ApprovedOvertimeData[]> => {
    return getAll<ApprovedOvertimeData>(
      'SELECT * FROM approved_overtime WHERE teacherId = ?',
      [teacherId]
    );
  },

  getByModule: async (moduleId: string): Promise<ApprovedOvertimeData[]> => {
    return getAll<ApprovedOvertimeData>(
      'SELECT * FROM approved_overtime WHERE moduleId = ?',
      [moduleId]
    );
  },

  isApproved: async (teacherId: string, moduleId: string): Promise<boolean> => {
    const result = await getAll<ApprovedOvertimeData>(
      'SELECT * FROM approved_overtime WHERE teacherId = ? AND moduleId = ?',
      [teacherId, moduleId]
    );
    return result.length > 0;
  },

  add: async (teacherId: string, moduleId: string): Promise<void> => {
    await run(
      'INSERT INTO approved_overtime (teacherId, moduleId) VALUES (?, ?)',
      [teacherId, moduleId]
    );
  },

  remove: async (teacherId: string, moduleId: string): Promise<void> => {
    await run(
      'DELETE FROM approved_overtime WHERE teacherId = ? AND moduleId = ?',
      [teacherId, moduleId]
    );
  },
};
