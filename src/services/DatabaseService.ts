import { run } from '../db';
import { AdminRepository } from '../repositories/AdminRepository';
import { AuthService } from './AuthService';
import { v4 as uuidv4 } from 'uuid';

export const DatabaseService = {
  initDB: async (): Promise<void> => {
    // Create tables
    await run(`CREATE TABLE IF NOT EXISTS admin_profile (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'ASSISTANT',
      profilePhoto TEXT
    )`, []);

    await run(`CREATE TABLE IF NOT EXISTS teachers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      grade VARCHAR(50),
      specialty VARCHAR(50),
      status VARCHAR(50),
      requiredHours INT,
      profilePhoto TEXT
    )`, []);

    await run(`CREATE TABLE IF NOT EXISTS approved_overtime (
      teacherId VARCHAR(36),
      moduleId VARCHAR(36),
      PRIMARY KEY (teacherId, moduleId)
    )`, []);

    await run(`CREATE TABLE IF NOT EXISTS parcours (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255),
      type VARCHAR(50),
      level VARCHAR(50),
      year INT,
      specialty VARCHAR(50),
      description TEXT
    )`, []);

    await run(`CREATE TABLE IF NOT EXISTS modules (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(50),
      name VARCHAR(255),
      semester INT,
      cmHours INT,
      tdHours INT,
      tpHours INT,
      parcoursId VARCHAR(36)
    )`, []);

    await run(`CREATE TABLE IF NOT EXISTS assignments (
      id VARCHAR(36) PRIMARY KEY,
      teacherId VARCHAR(36),
      moduleId VARCHAR(36),
      type VARCHAR(50),
      hours INT
    )`, []);

    await run(`CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(36) PRIMARY KEY,
      senderId VARCHAR(36),
      receiverId VARCHAR(36),
      content TEXT,
      createdAt DATETIME,
      status VARCHAR(50),
      moduleId VARCHAR(36),
      moduleType VARCHAR(50),
      hours INT,
      isRead TINYINT DEFAULT 0
    )`, []);

    // Seed default admin
    const admin = await AdminRepository.findByEmail('admin@sach.com');
    if (!admin) {
      const hashed = await AuthService.hashPassword('admin');
      await AdminRepository.create({
        name: 'Admin',
        email: 'admin@sach.com',
        password: hashed,
        role: 'SUPER_ADMIN',
      });
      console.log('Default admin created: admin@sach.com / admin');
    }
  },
};
