import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminRepository } from '../repositories/AdminRepository';
import { TeacherRepository } from '../repositories/TeacherRepository';

export interface AuthResult {
  success: boolean;
  token?: string;
  userId?: string;
  role?: string;
  error?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sach-secret';
const SALT_ROUNDS = 10;

export const AuthService = {
  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  generateToken: (userId: string, role: string): string => {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '24h' });
  },

  verifyToken: (token: string): { id: string; role: string } | null => {
    try {
      return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    } catch {
      return null;
    }
  },

  login: async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Try admin login
      const admin = await AdminRepository.findByEmail(email);
      if (admin && await AuthService.comparePassword(password, admin.password)) {
        const token = AuthService.generateToken(admin.id, 'ADMIN');
        return { success: true, token, userId: admin.id, role: 'ADMIN' };
      }

      // Try teacher login
      const teacher = await TeacherRepository.findByEmail(email);
      if (teacher && await AuthService.comparePassword(password, teacher.password)) {
        const token = AuthService.generateToken(teacher.id, 'TEACHER');
        return { success: true, token, userId: teacher.id, role: 'TEACHER' };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
