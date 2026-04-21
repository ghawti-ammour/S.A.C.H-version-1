import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// 1. DATABASE CONFIGURATION & SCHEMA
// ==========================================
const DB_PATH = process.env.DB_PATH || 'database.db';
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: parseInt(process.env.MYSQLPORT || '3306'),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Example query function to replace SQLite queries
async function queryDatabase(sql: string, params: any[]): Promise<any[]> {
  const [rows] = await db.execute(sql, params);
  return rows;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sach-secret-key-2024-pfe-excellence';

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_profile (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'ASSISTANT',
    profilePhoto TEXT
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    grade VARCHAR(50),
    specialty VARCHAR(50),
    status VARCHAR(50),
    requiredHours INT,
    profilePhoto TEXT
  );

  CREATE TABLE IF NOT EXISTS approved_overtime (
    teacherId VARCHAR(36),
    moduleId VARCHAR(36),
    PRIMARY KEY (teacherId, moduleId),
    FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS parcours (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    level VARCHAR(50),
    year INT,
    specialty VARCHAR(50),
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(255),
    semester INT,
    cmHours INT,
    tdHours INT,
    tpHours INT,
    parcoursId VARCHAR(36),
    FOREIGN KEY (parcoursId) REFERENCES parcours(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(36) PRIMARY KEY,
    teacherId VARCHAR(36),
    moduleId VARCHAR(36),
    type VARCHAR(50),
    hours INT,
    FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (moduleId) REFERENCES modules(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
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
  );
`, []);
});

// Support legacy migration
try {
  db.exec("ALTER TABLE admin_profile ADD COLUMN role TEXT DEFAULT 'ASSISTANT'");
} catch (e) { }

// Seed admin
const existingAdmin = db.prepare('SELECT * FROM admin_profile WHERE email = ?').get('admin@sach.com') as any;
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin', 10);
  db.prepare('INSERT INTO admin_profile (id, name, email, password, role, profilePhoto) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), 'Admin User', 'admin@sach.com', hashedPassword, 'SUPER_ADMIN', '');
} else if (!existingAdmin.password.startsWith('$2b$')) {
  const hashedPassword = bcrypt.hashSync(existingAdmin.password, 10);
  db.prepare('UPDATE admin_profile SET password = ? WHERE id = ?').run(hashedPassword, existingAdmin.id);
}

// ==========================================
// 2. MIDDLEWARE
// ==========================================

// JWT Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
}

// Administrative Check Middleware
function isAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access Denied: Admin Privileges Required' });
  }
  next();
}

// ==========================================
// 3. SERVER & ROUTES
// ==========================================
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- AUTH ROUTE ---
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // 1. Check Admin — look up by email first, then fallback to 'admin' username shortcut
      let admin: any = db.prepare('SELECT * FROM admin_profile WHERE email = ?').get(email);
      if (!admin && email === 'admin') {
        admin = db.prepare("SELECT * FROM admin_profile WHERE role = 'SUPER_ADMIN' LIMIT 1").get();
      }
      if (admin && admin.password) {
        const valid = await bcrypt.compare(String(password), String(admin.password));
        if (valid) {
          const token = jwt.sign({ id: admin.id, role: 'ADMIN', name: admin.name }, JWT_SECRET, { expiresIn: '24h' });
          return res.json({ success: true, token, session: { id: admin.id, role: 'ADMIN', name: admin.name } });
        }
      }

      // 2. Check Teacher
      const teacher = db.prepare('SELECT * FROM teachers WHERE email = ?').get(email) as any;
      if (teacher && teacher.password) {
        const valid = await bcrypt.compare(String(password), String(teacher.password));
        if (valid) {
          const token = jwt.sign({ id: teacher.id, role: 'TEACHER', name: teacher.name, teacherId: teacher.id }, JWT_SECRET, { expiresIn: '24h' });
          return res.json({ success: true, token, session: { id: teacher.id, role: 'TEACHER', name: teacher.name, teacherId: teacher.id } });
        }
      }

      res.status(401).json({ error: 'Invalid credentials' });
    } catch (error: any) {
      console.error('Login error:', error?.message || error);
      res.status(500).json({ error: 'Internal Server Error', details: error?.message });
    }
  });

  // --- ADMIN ROUTES (Protected) ---
  app.get('/api/admin/profile', authenticateToken, (req, res) => {
    const profile = db.prepare('SELECT * FROM admin_profile ORDER BY role DESC').get();
    res.json(profile);
  });

  app.get('/api/admin/profile/:id', authenticateToken, (req, res) => {
    const profile = db.prepare('SELECT * FROM admin_profile WHERE id = ?').get(req.params.id);
    res.json(profile);
  });

  app.get('/api/admin/main', (req, res) => {
    const mainAdmin = db.prepare("SELECT id, name FROM admin_profile WHERE role = 'SUPER_ADMIN'").get();
    res.json(mainAdmin);
  });

  app.put('/api/admin/profile/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, profilePhoto } = req.body;
    try {
      if (password && !password.startsWith('$2b$')) {
        const hashed = await bcrypt.hash(password, 10);
        db.prepare('UPDATE admin_profile SET name = ?, email = ?, password = ?, profilePhoto = ? WHERE id = ?')
          .run(name, email, hashed, profilePhoto, id);
      } else {
        db.prepare('UPDATE admin_profile SET name = ?, email = ?, profilePhoto = ? WHERE id = ?')
          .run(name, email, profilePhoto, id);
      }
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Update failed' }); }
  });

  // --- TEACHER ROUTES ---
  app.get('/api/teachers', authenticateToken, (req, res) => {
    try {
      const teachers = db.prepare('SELECT * FROM teachers').all();
      const teachersWithOvertime = teachers.map((t: any) => {
        const approvedOvertimeModuleIds = db.prepare('SELECT moduleId FROM approved_overtime WHERE teacherId = ?')
          .all(t.id).map((row: any) => row.moduleId);
        return { ...t, approvedOvertimeModuleIds };
      });
      res.json(teachersWithOvertime);
    } catch (e) { res.status(500).json({ error: 'Fetch failed' }); }
  });

  app.get('/api/teachers/:id/workload', authenticateToken, (req, res) => {
    try {
      const assignments = db.prepare('SELECT type, hours FROM assignments WHERE teacherId = ?').all(req.params.id) as any[];
      const cm = assignments.filter(a => a.type === 'CM').reduce((acc, curr) => acc + curr.hours, 0);
      const td = assignments.filter(a => a.type === 'TD').reduce((acc, curr) => acc + curr.hours, 0);
      const tp = assignments.filter(a => a.type === 'TP').reduce((acc, curr) => acc + curr.hours, 0);
      const teacher = db.prepare('SELECT requiredHours FROM teachers WHERE id = ?').get(req.params.id) as any;
      
      res.json({
        cm, td, tp,
        total: cm + td + tp,
        required: teacher?.requiredHours || 0
      });
    } catch (e) { res.status(500).json({ error: 'Workload calculation failed' }); }
  });

  app.post('/api/teachers', authenticateToken, isAdmin, async (req, res, next) => {
    try {
      const { name, email, password, grade, specialty, status, requiredHours, profilePhoto } = req.body;
      const hashedPassword = await bcrypt.hash(password || 'teacher123', 10);
      db.prepare('INSERT INTO teachers (id, name, email, password, grade, specialty, status, requiredHours, profilePhoto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(uuidv4(), name, email, hashedPassword, grade, specialty, status, requiredHours, profilePhoto || '');
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.put('/api/teachers/:id', authenticateToken, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, password, profilePhoto } = req.body;
      if (password && !password.startsWith('$2b$')) {
        const hashed = await bcrypt.hash(password, 10);
        db.prepare('UPDATE teachers SET name = ?, email = ?, password = ?, profilePhoto = ? WHERE id = ?')
          .run(name, email, hashed, profilePhoto, id);
      } else {
        db.prepare('UPDATE teachers SET name = ?, email = ?, profilePhoto = ? WHERE id = ?')
          .run(name, email, profilePhoto, id);
      }
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.delete('/api/teachers/:id', authenticateToken, isAdmin, (req, res, next) => {
    try {
      db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  // --- PARCOURS ROUTES ---
  app.get('/api/parcours', authenticateToken, (req, res) => {
    res.json(db.prepare('SELECT * FROM parcours').all());
  });

  app.post('/api/parcours', authenticateToken, isAdmin, (req, res, next) => {
    try {
      const { name, type, level, year, specialty, description } = req.body;
      db.prepare('INSERT INTO parcours (id, name, type, level, year, specialty, description) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(uuidv4(), name, type, level || null, year, specialty, description);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.delete('/api/parcours/:id', authenticateToken, isAdmin, (req, res, next) => {
    try {
      db.prepare('DELETE FROM parcours WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  // --- MODULE ROUTES ---
  app.get('/api/modules', authenticateToken, (req, res) => {
    res.json(db.prepare('SELECT * FROM modules').all());
  });

  app.post('/api/modules', authenticateToken, isAdmin, (req, res, next) => {
    try {
      const { code, name, semester, cmHours, tdHours, tpHours, parcoursId } = req.body;
      if (!parcoursId) {
        return res.status(400).json({ error: 'A module must be linked to a Parcours.' });
      }
      db.prepare('INSERT INTO modules (id, code, name, semester, cmHours, tdHours, tpHours, parcoursId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(uuidv4(), code, name, semester, cmHours, tdHours, tpHours, parcoursId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/modules/:id', authenticateToken, isAdmin, (req, res, next) => {
    try {
      db.prepare('DELETE FROM modules WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  // --- ASSIGNMENT ROUTES ---
  app.get('/api/assignments', authenticateToken, (req, res) => {
    res.json(db.prepare('SELECT * FROM assignments').all());
  });

  app.post('/api/assignments', authenticateToken, isAdmin, (req, res, next) => {
    try {
      const { teacherId, moduleId, type, hours } = req.body;
      db.prepare('INSERT INTO assignments (id, teacherId, moduleId, type, hours) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), teacherId, moduleId, type, hours);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.put('/api/assignments/:id', authenticateToken, isAdmin, (req, res, next) => {
    try {
      const { teacherId, moduleId, type, hours } = req.body;
      db.prepare('UPDATE assignments SET teacherId = ?, moduleId = ?, type = ?, hours = ? WHERE id = ?')
        .run(teacherId, moduleId, type, hours, req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.delete('/api/assignments/:id', authenticateToken, isAdmin, (req, res, next) => {
    try {
      db.prepare('DELETE FROM assignments WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  // --- MESSAGE ROUTES ---
  app.get('/api/messages', authenticateToken, (req, res) => {
    res.json(db.prepare('SELECT * FROM messages').all());
  });

  app.post('/api/messages', authenticateToken, (req, res, next) => {
    try {
      const { senderId, receiverId, content, createdAt, status, moduleId, moduleType, hours, isRead } = req.body;
      db.prepare('INSERT INTO messages (id, senderId, receiverId, content, createdAt, status, moduleId, moduleType, hours, isRead) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(uuidv4(), senderId, receiverId, content, createdAt, status, moduleId || null, moduleType || null, hours || null, isRead ? 1 : 0);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  app.put('/api/messages/read-all/:receiverId', authenticateToken, (req, res) => {
    db.prepare('UPDATE messages SET isRead = 1 WHERE receiverId = ?').run(req.params.receiverId);
    res.json({ success: true });
  });

  app.put('/api/messages/:id/status', authenticateToken, (req, res, next) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
      db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, id);
      if (status === 'ACCEPTED') {
        const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
        if (msg?.moduleId && msg?.receiverId) {
          db.prepare('INSERT OR IGNORE INTO approved_overtime (teacherId, moduleId) VALUES (?, ?)').run(msg.receiverId, msg.moduleId);
        }
      }
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    // Dev mode: use Vite middleware (dynamically imported so it doesn't affect production build)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve the built frontend from dist/
    app.use(express.static(__dirname));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  // --- GLOBAL ERROR HANDLER ---
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ 
      error: 'Database or Server Error', 
      details: err.message 
    });
  });

  const PORT = parseInt(process.env.PORT || '3000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`S.A.C.H Server running on http://localhost:${PORT} [JWT SECURED]`);
  });
}

startServer();
